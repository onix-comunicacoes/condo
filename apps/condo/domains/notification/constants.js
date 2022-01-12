/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 */

const JSON_NO_REQUIRED_ATTR_ERROR = '[json:noRequiredAttr:'
const JSON_SUSPICIOUS_ATTR_NAME_ERROR = '[json:suspiciousAttrName:'
const JSON_UNKNOWN_ATTR_NAME_ERROR = '[json:unknownAttrName:'

const SMS_TRANSPORT = 'sms'
const EMAIL_TRANSPORT = 'email'
const TELEGRAM_TRANSPORT = 'telegram'
const PUSH_TRANSPORT = 'push'
const MESSAGE_TRANSPORTS = [SMS_TRANSPORT, EMAIL_TRANSPORT, TELEGRAM_TRANSPORT, PUSH_TRANSPORT]

const INVITE_NEW_EMPLOYEE_MESSAGE_TYPE = 'INVITE_NEW_EMPLOYEE'
const SHARE_TICKET_MESSAGE_TYPE = 'SHARE_TICKET'
const DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE = 'DIRTY_INVITE_NEW_EMPLOYEE'
const REGISTER_NEW_USER_MESSAGE_TYPE = 'REGISTER_NEW_USER'
const RESET_PASSWORD_MESSAGE_TYPE = 'RESET_PASSWORD'
const SMS_VERIFY_CODE_MESSAGE_TYPE = 'SMS_VERIFY'
const DEVELOPER_IMPORTANT_NOTE_TYPE = 'DEVELOPER_IMPORTANT_NOTE_TYPE'
const CUSTOMER_IMPORTANT_NOTE_TYPE = 'CUSTOMER_IMPORTANT_NOTE_TYPE'

const MESSAGE_TYPES = [
    INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    REGISTER_NEW_USER_MESSAGE_TYPE,
    RESET_PASSWORD_MESSAGE_TYPE,
    SMS_VERIFY_CODE_MESSAGE_TYPE,
    SHARE_TICKET_MESSAGE_TYPE,
    DEVELOPER_IMPORTANT_NOTE_TYPE,
    CUSTOMER_IMPORTANT_NOTE_TYPE,
]

const MESSAGE_META = {
    [INVITE_NEW_EMPLOYEE_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        inviteCode: { defaultValue: '', required: true },
        userName: { defaultValue: 'USERNAME', required: false },
        userEmail: { defaultValue: '', required: false },
        userPhone: { defaultValue: '', required: false },
        organizationName: { defaultValue: 'ORGANIZATION', required: false },
    },
    [SHARE_TICKET_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        ticketNumber: { defaultValue: '', required: true },
        date: { defaultValue: '', required: true },
        id: { defaultValue: '', required: true },
        details: { defaultValue: '', required: true },
    },
    [DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        organizationName: { defaultValue: 'ORGANIZATION', required: false },
    },
    [REGISTER_NEW_USER_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        userPhone: { defaultValue: '', required: false },
        userPassword: { defaultValue: '', required: false },
    },
    [RESET_PASSWORD_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        token: { defaultValue: '', required: true },
        userName: { defaultValue: 'USERNAME', required: false },
        userEmail: { defaultValue: '', required: false },
    },
    [SMS_VERIFY_CODE_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        smsCode: { defaultValue: '', required: true },
    },
    [DEVELOPER_IMPORTANT_NOTE_TYPE]: {
        dv: { defaultValue: '', required: true },
        type: { defaultValue: 'UNKNOWN', required: true },
        data: { defaultValue: null, required: true },
    },
    [CUSTOMER_IMPORTANT_NOTE_TYPE]: {
        dv: { defaultValue: '', required: true },
        type: { defaultValue: 'UNKNOWN', required: true },
        data: { defaultValue: null, required: true },
    },
}

const MESSAGE_SENDING_STATUS = 'sending'
const MESSAGE_RESENDING_STATUS = 'resending'
const MESSAGE_PROCESSING_STATUS = 'processing'
const MESSAGE_ERROR_STATUS = 'error'
const MESSAGE_DELIVERED_STATUS = 'delivered'
const MESSAGE_CANCELED_STATUS = 'canceled'
const MESSAGE_STATUSES = [
    MESSAGE_SENDING_STATUS,
    MESSAGE_RESENDING_STATUS,
    MESSAGE_PROCESSING_STATUS,
    MESSAGE_ERROR_STATUS,
    MESSAGE_DELIVERED_STATUS,
    MESSAGE_CANCELED_STATUS,
]

module.exports = {
    JSON_NO_REQUIRED_ATTR_ERROR,
    JSON_SUSPICIOUS_ATTR_NAME_ERROR,
    JSON_UNKNOWN_ATTR_NAME_ERROR,
    SMS_TRANSPORT,
    EMAIL_TRANSPORT,
    TELEGRAM_TRANSPORT,
    PUSH_TRANSPORT,
    MESSAGE_TRANSPORTS,
    REGISTER_NEW_USER_MESSAGE_TYPE,
    SMS_VERIFY_CODE_MESSAGE_TYPE,
    INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    RESET_PASSWORD_MESSAGE_TYPE,
    DEVELOPER_IMPORTANT_NOTE_TYPE,
    MESSAGE_TYPES,
    MESSAGE_META,
    MESSAGE_SENDING_STATUS,
    MESSAGE_RESENDING_STATUS,
    MESSAGE_PROCESSING_STATUS,
    MESSAGE_ERROR_STATUS,
    MESSAGE_DELIVERED_STATUS,
    MESSAGE_CANCELED_STATUS,
    DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    MESSAGE_STATUSES,
    SHARE_TICKET_MESSAGE_TYPE,
    CUSTOMER_IMPORTANT_NOTE_TYPE,
}
