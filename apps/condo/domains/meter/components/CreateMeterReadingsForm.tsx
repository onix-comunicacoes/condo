import { Col, Form, Row, Typography } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from '@core/next/intl'
import { FormWithAction } from '@condo/domains/common/components/containers/FormList'
import Prompt from '@condo/domains/common/components/Prompt'
import { PropertyAddressSearchInput } from '@condo/domains/property/components/PropertyAddressSearchInput'
import { useObject } from '@condo/domains/property/utils/clientSchema/Property'
import { Meter, MeterReading } from '../utils/clientSchema'
import { useContactsEditorHook } from '@condo/domains/contact/components/ContactsEditor/useContactsEditorHook'
import uniqWith from 'lodash/uniqWith'
import {
    CALL_METER_READING_SOURCE_ID,
} from '../constants/constants'
import { useCreateMeterModal } from '../hooks/useCreateMeterModal'
import { IMeterUIState } from '../utils/clientSchema/Meter'
import { useRouter } from 'next/router'
import { useValidations } from '@condo/domains/common/hooks/useValidations'
import { SortMeterReadingsBy, SortMetersBy } from '@app/condo/schema'
import { IMeterReadingUIState } from '../utils/clientSchema/MeterReading'
import { UnitInfo } from '@condo/domains/property/components/UnitInfo'
import { EXISTING_METER_NUMBER_IN_SAME_ORGANIZATION,
    EXISTING_METER_ACCOUNT_NUMBER_IN_OTHER_UNIT } from '../constants/errors'
import { ContactsInfo } from '@condo/domains/ticket/components/BaseTicketForm'
import { Table } from '@condo/domains/common/components/Table/Index'
import { useMeterTableColumns } from '../hooks/useMeterTableColumns'
import { get } from 'lodash'
import { getTableScrollConfig } from '@condo/domains/common/utils/tables.utils'
import { useLayoutContext } from '@condo/domains/common/components/LayoutContext'
import { useUpdateMeterModal } from '../hooks/useUpdateMeterModal'
import { Gutter } from 'antd/es/grid/row'
import { CreateMeterReadingsActionBar } from './CreateMeterReadingsActionBar'

export const LAYOUT = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
}

type MetersTableRecord = {
    meter: IMeterUIState
    lastMeterReading: string
    meterReadingSource: string
    tariffNumber: string
}

function getTableData (meters: IMeterUIState[], meterReadings: IMeterReadingUIState[]): MetersTableRecord[] {
    const dataSource: MetersTableRecord[] = []
    const lastMeterReadings = uniqWith(meterReadings,
        (meterReading1, meterReading2) =>
            meterReading1.meter.id === meterReading2.meter.id
    )

    for (const meter of meters) {
        const meterTariffsCount = meter.numberOfTariffs
        const lastMeterReading = lastMeterReadings.find(meterReading => {
            const meterReadingMeterId = get(meterReading, ['meter', 'id'])

            return meterReadingMeterId === meter.id
        })

        if (meterTariffsCount > 1) {
            for (let tariffNumber = 1; tariffNumber <= meterTariffsCount; ++tariffNumber) {
                dataSource.push({
                    meter,
                    lastMeterReading: lastMeterReading && lastMeterReading[`value${tariffNumber}`],
                    meterReadingSource: lastMeterReading && lastMeterReading.source.name,
                    tariffNumber: String(tariffNumber),
                })
            }
        } else {
            dataSource.push({
                meter,
                lastMeterReading: lastMeterReading && lastMeterReading.value1,
                meterReadingSource: lastMeterReading && lastMeterReading.source.name,
                tariffNumber: '1',
            })
        }
    }

    return dataSource
}

const VALIDATE_FORM_TRIGGER = ['onBlur', 'onSubmit']
const FORM_ROW_LARGE_VERTICAL_GUTTER: [Gutter, Gutter] = [0, 40]
const FORM_ROW_MEDIUM_VERTICAL_GUTTER: [Gutter, Gutter] = [0, 20]

export const CreateMeterReadingsForm = ({ organization, role }) => {
    const intl = useIntl()
    const AddressLabel = intl.formatMessage({ id: 'field.Address' })
    const AddressPlaceholder = intl.formatMessage({ id: 'placeholder.Address' })
    const AddressNotFoundContent = intl.formatMessage({ id: 'field.Address.notFound' })
    const PromptTitle = intl.formatMessage({ id: 'pages.condo.meter.warning.modal.Title' })
    const PromptHelpMessage = intl.formatMessage({ id: 'pages.condo.meter.warning.modal.HelpMessage' })
    const ClientInfoMessage = intl.formatMessage({ id: 'ClientInfo' })
    const MetersAndReadingsMessage = intl.formatMessage({ id: 'pages.condo.meter.create.MetersAndReadings' })

    const { isSmall } = useLayoutContext()
    const { requiredValidator } = useValidations()
    const validations = {
        property: [requiredValidator],
    }

    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(null)
    const [selectedUnitName, setSelectedUnitName] = useState<string>(null)
    const selectPropertyIdRef = useRef(selectedPropertyId)
    useEffect(() => {
        selectPropertyIdRef.current = selectedPropertyId
        setSelectedUnitName(null)
    }, [selectedPropertyId])

    const selectedUnitNameRef = useRef(selectedUnitName)
    useEffect(() => {
        selectedUnitNameRef.current = selectedUnitName
    }, [selectedUnitName])

    const { createContact, canCreateContact, ContactsEditorComponent } = useContactsEditorHook({
        organization: organization.id,
        role,
    })

    const { obj: property, loading: propertyLoading } = useObject({
        where: { id: selectedPropertyId ? selectedPropertyId : null },
    })

    const canCreateContactRef = useRef(canCreateContact)
    useEffect(() => {
        canCreateContactRef.current = canCreateContact
    }, [canCreateContact])

    const router = useRouter()
    const { objs: meters, refetch: refetchMeters, loading: metersLoading, count: total } = Meter.useObjects({
        where: {
            property: { id: selectedPropertyId },
            unitName: selectedUnitName,
        },
        orderBy: SortMetersBy.CreatedAtDesc,
    })
    const meterIds = meters.map(meter => meter.id)
    const { objs: meterReadings, refetch: refetchMeterReadings, loading: meterReadingsLoading } = MeterReading.useObjects({
        where: {
            meter: { id_in: meterIds },
        },
        sortBy: [SortMeterReadingsBy.CreatedAtDesc],
    })

    const refetch = useCallback(() => {
        refetchMeters()
        refetchMeterReadings()
    }, [refetchMeterReadings, refetchMeters])
    const loading = metersLoading || meterReadingsLoading
    const { CreateMeterModal, setIsCreateMeterModalVisible } = useCreateMeterModal(organization.id, selectedPropertyId, selectedUnitName, refetch)
    const dataSource = useMemo(() => getTableData(meters, meterReadings), [meterReadings, meters])
    const { tableColumns, newMeterReadings, setNewMeterReadings } = useMeterTableColumns()
    const { UpdateMeterModal, setSelectedMeter } = useUpdateMeterModal(refetch)
    const handleRowAction = useCallback((record) => {
        return {
            onClick: () => {
                const meter = get(record, 'meter')
                setSelectedMeter(meter)
            },
        }
    }, [setSelectedMeter])
    const handleAddMeterButtonClick = useCallback(() => setIsCreateMeterModalVisible(true),
        [setIsCreateMeterModalVisible])

    useEffect(() => {
        refetch()
        setNewMeterReadings({})
    }, [selectedPropertyId, selectedUnitName])

    const createMeterReadingAction = MeterReading.useCreate({
        source: CALL_METER_READING_SOURCE_ID,
    }, () => {
        router.push('/meter')
    })

    const handleSubmit = useCallback(async (values) => {
        let createdContact
        if (role && role.canManageContacts && canCreateContactRef.current) {
            createdContact = await createContact(organization.id, selectPropertyIdRef.current, selectedUnitNameRef.current)
        }

        for (const [meterId, newMeterReading] of Object.entries(newMeterReadings)) {
            const value1 = get(newMeterReading, '1')
            const value2 = get(newMeterReading, '2')
            const value3 = get(newMeterReading, '3')
            const value4 = get(newMeterReading, '4')

            const { property, unitName, sectionName, floorName, ...clientInfo } = values

            createMeterReadingAction({
                ...clientInfo,
                organization: organization.id,
                contact: get(createdContact, 'id') || values.contact,
                meter: meterId,
                date: new Date(),
                value1,
                value2,
                value3,
                value4,
            })
        }
    }, [createContact, createMeterReadingAction, newMeterReadings, organization.id, role])

    return (
        <FormWithAction
            {...LAYOUT}
            validateTrigger={VALIDATE_FORM_TRIGGER}
            action={handleSubmit}
            formValuesToMutationDataPreprocessor={(values) => {
                values.property = selectPropertyIdRef.current
                values.unitName = selectedUnitNameRef.current
                return values
            }}
        >
            {({ handleSave, form }) => (
                <>
                    <Prompt
                        title={PromptTitle}
                        form={form}
                        handleSave={handleSave}
                    >
                        <Typography.Paragraph>
                            {PromptHelpMessage}
                        </Typography.Paragraph>
                    </Prompt>
                    <Col span={24}>
                        <Row gutter={FORM_ROW_LARGE_VERTICAL_GUTTER}>
                            <Col lg={18} md={24}>
                                <Row gutter={FORM_ROW_LARGE_VERTICAL_GUTTER}>
                                    <Col span={24}>
                                        <Row justify={'space-between'} gutter={FORM_ROW_MEDIUM_VERTICAL_GUTTER}>
                                            <Col span={24}>
                                                <Typography.Title level={5}>
                                                    {ClientInfoMessage}
                                                </Typography.Title>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item
                                                    name={'property'}
                                                    label={AddressLabel}
                                                    rules={validations.property}
                                                >
                                                    <PropertyAddressSearchInput
                                                        organization={organization}
                                                        autoFocus={true}
                                                        onSelect={(_, option) => {
                                                            form.setFieldsValue({
                                                                unitName: null,
                                                                sectionName: null,
                                                                floorName: null,
                                                            })
                                                            setSelectedPropertyId(String(option.key))
                                                        }}
                                                        placeholder={AddressPlaceholder}
                                                        notFoundContent={AddressNotFoundContent}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            {
                                                selectedPropertyId && (
                                                    <Col span={24}>
                                                        <UnitInfo
                                                            property={property}
                                                            loading={propertyLoading}
                                                            setSelectedUnitName={setSelectedUnitName}
                                                            form={form}
                                                        />
                                                    </Col>
                                                )
                                            }
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <ContactsInfo
                                            ContactsEditorComponent={ContactsEditorComponent}
                                            form={form}
                                            initialValues={{}}
                                            selectedPropertyId={selectedPropertyId}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Row gutter={FORM_ROW_MEDIUM_VERTICAL_GUTTER}>
                                    <Typography.Title level={2}>{MetersAndReadingsMessage}</Typography.Title>
                                    {
                                        selectedUnitName ? (
                                            <Table
                                                scroll={getTableScrollConfig(isSmall)}
                                                loading={loading}
                                                totalRows={total}
                                                dataSource={dataSource}
                                                columns={tableColumns}
                                                pagination={false}
                                                onRow={handleRowAction}
                                            />
                                        ) : null
                                    }
                                </Row>
                            </Col>
                            <Col span={24}>
                                <CreateMeterReadingsActionBar
                                    handleSave={handleSave}
                                    newMeterReadings={newMeterReadings}
                                    handleAddMeterButtonClick={handleAddMeterButtonClick}
                                    isLoading={loading}
                                />
                            </Col>
                            <CreateMeterModal />
                            <UpdateMeterModal />
                        </Row>
                    </Col>
                </>
            )}
        </FormWithAction>
    )
}