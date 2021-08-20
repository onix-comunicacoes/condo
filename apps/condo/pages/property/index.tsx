/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/** @jsx jsx */
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { PageContent, PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { Typography, Space, Radio, Row, Col, Input, Table, Tabs } from 'antd'
import { DatabaseFilled, DiffOutlined } from '@ant-design/icons'
import Head from 'next/head'
import { css, jsx } from '@emotion/core'
import { MapGL } from '@condo/domains/common/components/MapGL'
import { Button } from '@condo/domains/common/components/Button'
import { IFilters } from '@condo/domains/property/utils/helpers'
import { useIntl } from '@core/next/intl'
import { useRouter } from 'next/router'
import { EXPORT_PROPERTIES_TO_EXCEL } from '@condo/domains/property/gql'
import { useLazyQuery } from '@core/next/apollo'

import qs from 'qs'
import pickBy from 'lodash/pickBy'
import get from 'lodash/get'
import has from 'lodash/has'

import {
    getPageIndexFromQuery,
    getSortStringFromQuery,
    sorterToQuery,
    filtersToQuery,
    PROPERTY_PAGE_SIZE,
} from '@condo/domains/property/utils/helpers'
import { getFiltersFromQuery } from '@condo/domains/common/utils/helpers'

import { useTableColumns as usePropertyTableColumns } from '@condo/domains/property/hooks/useTableColumns'
import { useTableColumns as useDivisionTableColumns } from '@condo/domains/division/hooks/useTableColumns'
import { generateExcelData } from '@condo/domains/property/utils/helpers'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { Property } from '@condo/domains/property/utils/clientSchema'
import debounce from 'lodash/debounce'
import { ImportWrapper } from '@condo/domains/common/components/Import/Index'
import { useImporterFunctions } from '@condo/domains/property/hooks/useImporterFunctions'

import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { TitleHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { useOrganization } from '@core/next/organization'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { Division } from '../../domains/division/utils/clientSchema'

export const PropertyPageViewMap = ({ searchPropertyQuery }): React.FC => {
    const {
        objs: properties,
    } = Property.useObjects({
        where: searchPropertyQuery,
    }, {
        fetchPolicy: 'network-only',
    })
    const mapCss = css`
        position: absolute;
        top: 280px;
        bottom: 0;
        right: 0;
        left: 0;
    `
    const points = properties
        .filter(property => has(property, ['addressMeta', 'data']))
        .map(property => {
            const { geo_lat, geo_lon } = property.addressMeta.data
            return {
                title: property.name,
                text: property.address,
                location: { lat: geo_lat, lng: geo_lon },
                route: `/property/${property.id}/`,
            }
        })

    return (
        <MapGL points={points} containerCss={mapCss} />
    )
}

const DivisionPageViewTable = () => {

    const intl = useIntl()

    // EXCEL TABLE FIELDS
    const ExcelAddressLabel = intl.formatMessage({ id: 'field.Address' })
    const ExcelOrganizationLabel = intl.formatMessage({ id: 'pages.condo.property.field.Organization' })
    const ExcelUnitsCountLabel = intl.formatMessage({ id: 'pages.condo.property.id.UnitsCount' })
    const ExcelTicketsInWorkLabel = intl.formatMessage({ id: 'pages.condo.property.id.TicketsInWork' })


    const router = useRouter()
    const { organization, link: { role } } = useOrganization()

    const filtersState = useState(false)
    const filtersFromQuery = getFiltersFromQuery<IFilters>(router.query)
    const sortFromQuery = getSortStringFromQuery(router.query)
    const offsetFromQuery = getPageIndexFromQuery(router.query)

    const tableColumns = useDivisionTableColumns(sortFromQuery, filtersFromQuery, filtersState[1])
    const searchPropertyQuery = { ...filtersToQuery(filtersFromQuery), organization: { id: organization.id } }

    const objects = Division.useObjects({
        sortBy: sortFromQuery,
        where: searchPropertyQuery,
        skip: (offsetFromQuery * PROPERTY_PAGE_SIZE) - PROPERTY_PAGE_SIZE,
        first: PROPERTY_PAGE_SIZE,
    }, {
        fetchPolicy: 'network-only',
    })
    console.log(objects.objs)
    const dataCols = [
        'address',
        'organization',
        'unitsCount',
        'ticketsInWork',
    ]
    const headers = [
        [
            ExcelAddressLabel,
            ExcelOrganizationLabel,
            ExcelUnitsCountLabel,
            ExcelTicketsInWorkLabel,
        ],
    ]
    const generateExcelData = useCallback(() => generateExcelData(Property, headers, dataCols, objects.objs), [objects.objs])
    return <BasePageViewTable
        tableColumns={tableColumns}
        role={role}
        filtersState={filtersState}
        createRoute="/division/create"
        objects={objects}
        generateExcelData={generateExcelData}
    />
}


const BuildingsPageViewTable = () => {

    const intl = useIntl()

    // EXCEL TABLE FIELDS
    const ExcelAddressLabel = intl.formatMessage({ id: 'field.Address' })
    const ExcelOrganizationLabel = intl.formatMessage({ id: 'pages.condo.property.field.Organization' })
    const ExcelUnitsCountLabel = intl.formatMessage({ id: 'pages.condo.property.id.UnitsCount' })
    const ExcelTicketsInWorkLabel = intl.formatMessage({ id: 'pages.condo.property.id.TicketsInWork' })


    const router = useRouter()
    const { organization, link: { role } } = useOrganization()

    const filtersState = useState(false)
    const filtersFromQuery = getFiltersFromQuery<IFilters>(router.query)
    const sortFromQuery = getSortStringFromQuery(router.query)
    const offsetFromQuery = getPageIndexFromQuery(router.query)

    const tableColumns = usePropertyTableColumns(sortFromQuery, filtersFromQuery, filtersState[1])
    const searchPropertyQuery = { ...filtersToQuery(filtersFromQuery), organization: { id: organization.id } }

    const objects = Property.useObjects({
        sortBy: sortFromQuery,
        where: searchPropertyQuery,
        skip: (offsetFromQuery * PROPERTY_PAGE_SIZE) - PROPERTY_PAGE_SIZE,
        first: PROPERTY_PAGE_SIZE,
    }, {
        fetchPolicy: 'network-only',
    })

    const dataCols = [
        'address',
        'organization',
        'unitsCount',
        'ticketsInWork',
    ]
    const headers = [
        [
            ExcelAddressLabel,
            ExcelOrganizationLabel,
            ExcelUnitsCountLabel,
            ExcelTicketsInWorkLabel,
        ],
    ]
    const generateExcelData = useCallback(() => generateExcelData(Property, headers, dataCols, objects.objs), [objects.objs])
    return <BasePageViewTable
        tableColumns={tableColumns}
        role={role}
        filtersState={filtersState}
        createRoute="/property/create"
        objects={objects}
        generateExcelData={generateExcelData}
    />
}

type BasePageViewTableProps = {
    tableColumns: any
    role: any
    createRoute: string
    generateExcelData: () => void
    filtersState: [boolean, Dispatch<SetStateAction<boolean>>]
    objects: ReturnType<typeof Property.useObjects> | ReturnType<typeof Division.useObjects>
}

export const BasePageViewTable = ({
    tableColumns,
    filtersState,
    role,
    createRoute,
    generateExcelData,
    objects,
}): React.FC<BasePageViewTableProps> => {
    const intl = useIntl()

    const ExportAsExcel = intl.formatMessage({ id: 'ExportAsExcel' })
    const CreateLabel = intl.formatMessage({ id: 'pages.condo.property.index.CreatePropertyButtonLabel' })
    const SearchPlaceholder = intl.formatMessage({ id: 'filters.FullSearch' })
    const PageTitleMsg = intl.formatMessage({ id: 'pages.condo.property.id.PageTitle' })
    const ServerErrorMsg = intl.formatMessage({ id: 'ServerError' })
    const PropertiesMessage = intl.formatMessage({ id: 'menu.Property' })

    const router = useRouter()

    const filtersFromQuery = getFiltersFromQuery<IFilters>(router.query)
    const offsetFromQuery = getPageIndexFromQuery(router.query)


    const [filtersApplied, setFiltersApplied] = filtersState
    const { fetchMore, loading, error, refetch, objs: properties, count: total } = objects
    const handleTableChange = useCallback(debounce((...tableChangeArguments) => {
        const [nextPagination, nextFilters, nextSorter] = tableChangeArguments
        const { current, pageSize } = nextPagination
        const offset = filtersApplied ? 0 : current * pageSize - pageSize
        const sort = sorterToQuery(nextSorter)
        const filters = filtersToQuery(nextFilters)
        setFiltersApplied(false)
        if (!loading) {
            fetchMore({
                sortBy: sort,
                where: filters,
                skip: offset,
                first: PROPERTY_PAGE_SIZE,
            }).then(() => {
                const query = qs.stringify(
                    { ...router.query, sort, offset, filters: JSON.stringify(pickBy({ ...filtersFromQuery, ...nextFilters })) },
                    { arrayFormat: 'comma', skipNulls: true, addQueryPrefix: true },
                )
                setDownloadLink(null)
                router.push(router.route + query)
            })
        }
    }, 400), [loading])

    const [search, handleSearchChange] = useSearch<IFilters>(loading)

    const handleRowAction = (record) => {
        return {
            onClick: () => {
                router.push(`/property/${record.id}/`)
            },
        }
    }

    const [columns, propertyNormalizer, propertyValidator, propertyCreator] = useImporterFunctions()

    if (error) {
        return <LoadingOrErrorPage title={PageTitleMsg} loading={loading} error={error ? ServerErrorMsg : null} />
    }

    const canManageProperties = get(role, 'canManageProperties', false)

    return (
        <Row align={'middle'} gutter={[0, 40]}>
            <Col span={6}>
                <Input
                    placeholder={SearchPlaceholder}
                    onChange={(e) => { handleSearchChange(e.target.value) }}
                    value={search}
                />
            </Col>
            <Col span={6} push={1}>
                <Button type={'inlineLink'} icon={<DatabaseFilled />} onClick={() => generateExcelData()} >{ExportAsExcel}</Button>
            </Col>
            <Col span={6} push={6} align={'right'}>
                {
                    canManageProperties ? (
                        <Space size={16}>
                            <ImportWrapper
                                objectsName={PropertiesMessage}
                                accessCheck={canManageProperties}
                                onFinish={refetch}
                                columns={columns}
                                rowNormalizer={propertyNormalizer}
                                rowValidator={propertyValidator}
                                objectCreator={propertyCreator}
                            >
                                <Button
                                    type={'sberPrimary'}
                                    icon={<DiffOutlined />}
                                    secondary
                                />
                            </ImportWrapper>
                            <Button type='sberPrimary' onClick={() => router.push(createRoute)}>
                                {CreateLabel}
                            </Button>
                        </Space>
                    ) : null
                }
            </Col>
            <Col span={24}>
                <Table
                    bordered
                    tableLayout={'fixed'}
                    loading={loading}
                    dataSource={properties}
                    onRow={handleRowAction}
                    rowKey={record => record.id}
                    columns={tableColumns}
                    onChange={handleTableChange}
                    pagination={{
                        showSizeChanger: false,
                        total,
                        current: offsetFromQuery,
                        pageSize: PROPERTY_PAGE_SIZE,
                        position: ['bottomLeft'],
                    }}
                />
            </Col>
        </Row>
    )
}

export const PropertiesPage = () => {
    const intl = useIntl()
    const PageTitleMessage = intl.formatMessage({ id: 'pages.condo.property.index.PageTitle' })
    const ShowMap = intl.formatMessage({ id: 'pages.condo.property.index.ViewModeMap' })
    const ShowTable = intl.formatMessage({ id: 'pages.condo.property.index.ViewModeTable' })
    const BuildingsTabTitle = intl.formatMessage({ id: 'pages.condo.property.index.Buildings.Tab.Title' })
    const DivisionsTabTitle = intl.formatMessage({ id: 'pages.condo.property.index.Divisions.Tab.Title' })

    const [propertiesType, setPropertiesType] = useState<'buildings' | 'divisions'>('buildings')


    const [viewMode, changeViewMode] = useState('list')

    return (
        <>
            <Head>
                <title>{PageTitleMessage}</title>
            </Head>
            <PageWrapper>
                <PageContent>
                    <Row gutter={[0, 40]} align={'top'} style={{ zIndex: 1, position: 'relative' }}>
                        <Col span={6} >
                            <PageHeader style={{ background: 'transparent' }} title={<Typography.Title>
                                {PageTitleMessage}
                            </Typography.Title>} />
                            {viewMode !== 'map' && <Tabs defaultActiveKey="0" onChange={(key: number) => setPropertiesType(['buildings', 'divisions'][key])}>
                                <Tabs.TabPane tab={BuildingsTabTitle} key="0" />
                                <Tabs.TabPane tab={DivisionsTabTitle} key="1" />
                            </Tabs>}
                        </Col>
                        <Col span={6} push={12} align={'right'} style={{ top: 10 }}>
                            <Radio.Group className={'sberRadioGroup'} value={viewMode} buttonStyle="outline" onChange={e => changeViewMode(e.target.value)}>
                                <Radio.Button value="list">{ShowTable}</Radio.Button>
                                <Radio.Button value="map">{ShowMap}</Radio.Button>
                            </Radio.Group>
                        </Col>
                        {viewMode !== 'map' &&
                            <Col span={24}>
                                {propertiesType === 'buildings' ? <BuildingsPageViewTable /> : <DivisionPageViewTable />}
                            </Col>
                        }
                    </Row>
                    <>
                        {
                            viewMode === 'map' ? (
                                <PropertyPageViewMap
                                    searchPropertyQuery={searchPropertyQuery}
                                />
                            ) : null
                        }
                    </>
                </PageContent>
            </PageWrapper>
        </>
    )
}


PropertiesPage.headerAction = <TitleHeaderAction descriptor={{ id: 'menu.Property' }} />
PropertiesPage.requiredAccess = OrganizationRequired

export default PropertiesPage
