const { SBBOL_FINGERPRINT_NAME } = require('./common')
const { SUBSCRIPTION_PAYMENT_STATUS } = require('@condo/domains/subscription/constants')

const dvSenderFields = {
    dv: 1,
    sender: { dv: 1, fingerprint: SBBOL_FINGERPRINT_NAME },
}

const BANK_OPERATION_CODE = {
    BUYING: '06',
}

const SBBOL_PAYMENT_STATUS_MAP = {
    DELIVERED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    VALIDEDS: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    INVALIDEDS: SUBSCRIPTION_PAYMENT_STATUS.ERROR,
    REQUISITEERROR: SUBSCRIPTION_PAYMENT_STATUS.ERROR,
    TRIED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    DELAYED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    CORRESPONDENT_APPROVE_WAITING: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    EXPORTED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    IMPLEMENTED: SUBSCRIPTION_PAYMENT_STATUS.DONE,
    REFUSEDBYABS: SUBSCRIPTION_PAYMENT_STATUS.ERROR,
    ACCEPTED_BY_ABS: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    CARD2: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    SIGNED_BANK: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    ACCEPTED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    CHECKERROR: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    UNABLE_TO_RECEIVE: SUBSCRIPTION_PAYMENT_STATUS.ERROR,
    CREATED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    INCONSISTENT_DATA: SUBSCRIPTION_PAYMENT_STATUS.ERROR,
    SENDED_TO_PAYER: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    ACCEPTANCE: SUBSCRIPTION_PAYMENT_STATUS.DONE,
    NONEACCEPTANCE: SUBSCRIPTION_PAYMENT_STATUS.CANCELLED,
    PARTSIGNED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
    SIGNED: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
}

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 // real TTL is 180 days bit we need to update it earlier

module.exports = {
    dvSenderFields,
    BANK_OPERATION_CODE,
    SBBOL_PAYMENT_STATUS_MAP,
    REFRESH_TOKEN_TTL,
}
