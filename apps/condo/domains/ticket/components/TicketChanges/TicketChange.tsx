import React  from 'react'
import { Row, Col, Typography, Tooltip } from 'antd'
import { get, has } from 'lodash'
import styled from '@emotion/styled'
import { TicketChange as TicketChangeType } from '@app/condo/schema'
import { useLayoutContext } from '@condo/domains/common/components/LayoutContext'
import { TicketStatus } from '@condo/domains/ticket/utils/clientSchema'
import { useIntl } from '@core/next/intl'
import { PhoneLink } from '@condo/domains/common/components/PhoneLink'
import { green } from '@ant-design/colors'
import { MAX_DESCRIPTION_DISPLAY_LENGTH } from '@condo/domains/ticket/constants/restrictions'
import { FormattedMessage } from 'react-intl'
import { fontSizes } from '@condo/domains/common/constants/style'
import dayjs from 'dayjs'

interface ITicketChangeProps {
    ticketChange: TicketChangeType
}

interface ITicketChangeFieldMessages {
    add?: string,
    change?: string,
    remove?: string,
}

enum TicketChangeFieldMessageType {
    From,
    To,
}

export const TicketChange: React.FC<ITicketChangeProps> = ({ ticketChange }) => {
    const changedFieldMessages = useChangedFieldMessagesOf(ticketChange)
    const { isSmall } = useLayoutContext()

    const formattedDate = dayjs(ticketChange.createdAt).format('DD.MM.YY')
    const formattedTime = dayjs(ticketChange.createdAt).format('HH:mm')

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} lg={6}>
                <Typography.Text style={isSmall && { fontSize: fontSizes.content }} disabled={isSmall}>
                    {formattedDate}
                    <Typography.Text type={'secondary'}>, {formattedTime}</Typography.Text>
                </Typography.Text>
            </Col>
            <Col xs={24} lg={18}>
                {changedFieldMessages.map(({ field, message }) => (
                    <Typography.Text key={field} style={{ fontSize: fontSizes.content }}>
                        <Diff className={field}>
                            {message}
                        </Diff>
                    </Typography.Text>
                ))}
            </Col>
        </Row>
    )
}

const useChangedFieldMessagesOf = (ticketChange) => {
    const intl = useIntl()
    const ClientPhoneMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.clientPhone' })
    const DetailsMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.details' })
    const ClientNameMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.clientName' })
    const StatusDisplayNameMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.statusDisplayName' })
    const AssigneeMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.assignee' })
    const ExecutorMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.executor' })
    const ClassifierMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.classifier' })
    const AddressMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.address' })
    const DeadlineMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.deadline' })
    const CanReadByResidentMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.canReadByResident' })

    const IsPaidMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.ticketType' })
    const IsEmergencyMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.ticketType' })
    const IsWarrantyMessage = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.ticketType' })

    const ShortFlatNumber = intl.formatMessage({ id: 'field.ShortFlatNumber' })

    const { objs: ticketStatuses } = TicketStatus.useObjects({})

    const fields = [
        ['canReadByResident', CanReadByResidentMessage, { change: 'pages.condo.ticket.TicketChanges.canReadByResident.change' }],
        ['clientPhone', ClientPhoneMessage],
        ['details', DetailsMessage, { change: 'pages.condo.ticket.TicketChanges.details.change' }],
        ['clientName', ClientNameMessage],
        ['isPaid', IsPaidMessage],
        ['isEmergency', IsEmergencyMessage],
        ['isWarranty', IsWarrantyMessage],
        ['statusDisplayName', StatusDisplayNameMessage, { change: 'pages.condo.ticket.TicketChanges.status.change' }],
        ['propertyDisplayName', AddressMessage],
        ['assigneeDisplayName', AssigneeMessage],
        ['executorDisplayName', ExecutorMessage],
        ['classifierDisplayName', ClassifierMessage],
        ['placeClassifierDisplayName', ClassifierMessage],
        ['deadline', DeadlineMessage],
    ]

    const BooleanToString = {
        canReadByResident: {
            'true': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.canReadByResident.true' }),
            'false': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.canReadByResident.false' }),
        },
        isPaid: {
            'true': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.isPaid.true' }),
            'false': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.isPaid.false' }),
        },
        isEmergency: {
            'true': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.isEmergency.true' }),
            'false': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.isEmergency.false' }),
        },
        isWarranty: {
            'true': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.isWarranty.true' }),
            'false': intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.isWarranty.false' }),
        },
    }

    const formatField = (field, value, type: TicketChangeFieldMessageType) => {
        const formatterFor = {
            statusDisplayName: (field, value) => {
                const statusIdTo = get(ticketChange, 'statusIdTo')
                const ticketStatus = ticketStatuses.find(status => status.id === statusIdTo)
                const ticketStatusColor = get(ticketStatus, ['colors', 'primary'])
                const ticketStatusChangeTextStyle = { color: ticketStatusColor }

                return <Typography.Text style={ticketStatusChangeTextStyle}>{value}</Typography.Text>
            },
            deadline: (field, value) => {
                return <Typography.Text>{dayjs(value).format('DD MMMM YYYY')}</Typography.Text>
            },
            clientPhone: (field, value) => (
                <PhoneLink value={value} />
            ),
            details: (field, value) => (
                value.length > MAX_DESCRIPTION_DISPLAY_LENGTH ? (
                    <Tooltip title={value}
                        placement="top"
                        overlayStyle={{
                            maxWidth: '80%',
                        }}>
                        {value.slice(0, MAX_DESCRIPTION_DISPLAY_LENGTH) + '…'}
                    </Tooltip>
                ) : value
            ),
            propertyDisplayName: (field, value, type: TicketChangeFieldMessageType) => {
                let unitNameToDisplay
                const unitNameFrom = ticketChange['unitNameFrom']
                const unitNameTo = ticketChange['unitNameTo']
                if (type === TicketChangeFieldMessageType.From && unitNameFrom) {
                    unitNameToDisplay = unitNameFrom
                }
                else if (type === TicketChangeFieldMessageType.To && unitNameTo) {
                    unitNameToDisplay = unitNameTo
                }

                return unitNameToDisplay ? `${value}, ${ShortFlatNumber} ${unitNameToDisplay}` : value
            },
            placeClassifierDisplayName: (field, value, type: TicketChangeFieldMessageType) => {
                let placeClassifierToDisplay
                let categoryClassifierToDisplay
                let problemClassifierToDisplay

                if (type === TicketChangeFieldMessageType.From) {
                    placeClassifierToDisplay = ticketChange['placeClassifierDisplayNameFrom']
                    categoryClassifierToDisplay = ticketChange['categoryClassifierDisplayNameFrom']
                    problemClassifierToDisplay = ticketChange['problemClassifierDisplayNameFrom']
                }
                else if (type === TicketChangeFieldMessageType.To) {
                    placeClassifierToDisplay = ticketChange['placeClassifierDisplayNameTo']
                    categoryClassifierToDisplay = ticketChange['categoryClassifierDisplayNameTo']
                    problemClassifierToDisplay = ticketChange['problemClassifierDisplayNameTo']
                }

                return `${placeClassifierToDisplay} → ${categoryClassifierToDisplay}${problemClassifierToDisplay ? ` → ${problemClassifierToDisplay}` : ''}`
            },
        }
        return has(formatterFor, field)
            ? formatterFor[field](field, value, type)
            : <Typography.Text>{value}</Typography.Text>
    }

    const formatDiffMessage = (field, message, ticketChange, customMessages: ITicketChangeFieldMessages = {}) => {
        if (typeof ticketChange[`${field}To`] === 'boolean') {
            const valueTo = BooleanToString[field][ticketChange[`${field}To`]]

            return (
                <>
                    <SafeUserMention createdBy={ticketChange.createdBy} />
                    &nbsp;
                    <FormattedMessage
                        id={ customMessages.change ? customMessages.change : 'pages.condo.ticket.TicketChanges.boolean.change' }
                        values={{
                            field: message,
                            to: valueTo,
                        }}
                    />
                </>
            )
        }

        const valueFrom = formatField(field, ticketChange[`${field}From`], TicketChangeFieldMessageType.From)
        const valueTo = formatField(field, ticketChange[`${field}To`], TicketChangeFieldMessageType.To)

        if (valueFrom && valueTo) {
            return (
                <>
                    <SafeUserMention createdBy={ticketChange.createdBy} />
                    &nbsp;
                    <FormattedMessage
                        id={ customMessages.change ? customMessages.change : 'pages.condo.ticket.TicketChanges.change' }
                        values={{
                            field: message,
                            from: valueFrom,
                            to: valueTo,
                        }}
                    />
                </>
            )
        } else if (valueTo) { // only "to" part
            return (
                <>
                    <SafeUserMention createdBy={ticketChange.createdBy} />
                    &nbsp;
                    <FormattedMessage
                        id={ customMessages.add ? customMessages.add : 'pages.condo.ticket.TicketChanges.add' }
                        values={{
                            field: message,
                            to: valueTo,
                        }}
                    />
                </>
            )
        } else if (valueFrom) {
            return (
                <>
                    <SafeUserMention createdBy={ticketChange.createdBy} />
                    &nbsp;
                    <FormattedMessage
                        id={ customMessages.remove ? customMessages.remove : 'pages.condo.ticket.TicketChanges.remove' }
                        values={{
                            field: message,
                            from: valueFrom,
                        }}
                    />
                </>
            )
        }
    }

    // Omit what was not changed
    const changedFields = fields.filter(([field]) => (
        ticketChange[`${field}From`] !== null && ticketChange[`${field}To`] !== null
    ))

    return changedFields.map(([field, message, changeMessage]) => ({
        field,
        message: formatDiffMessage(field, message, ticketChange, changeMessage),
    }))
}

const SafeUserMention = ({ createdBy }) => {
    const intl = useIntl()
    const DeletedCreatedAtNoticeTitle = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.notice.DeletedCreatedAt.title' })
    const DeletedCreatedAtNoticeDescription = intl.formatMessage({ id: 'pages.condo.ticket.TicketChanges.notice.DeletedCreatedAt.description' })
    return (
        createdBy ? (
            createdBy.name
        ) : (
            <Tooltip placement="top" title={DeletedCreatedAtNoticeDescription}>
                <span>{DeletedCreatedAtNoticeTitle}</span>
            </Tooltip>
        )
    )
}

const Diff = styled.p`
    &.statusDisplayName {
        del, ins {
            font-weight: bold;
            color: black;
        }
    }
    &.details, &.isEmergency, &.isPaid, &.isWarranty, &.classifierDisplayName {
        del, ins {
            color: black;
            span {
                color: black;
            }
        }
    }
    span, del, ins {
        &, a {
            color: ${green[6]};
        }
    }
    del, ins {
        text-decoration: none;
    }
    del, ins {
        span:hover {
            background: ${green[6]}
        }
    }
`