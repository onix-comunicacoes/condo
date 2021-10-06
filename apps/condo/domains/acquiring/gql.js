/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const ACQUIRING_INTEGRATION_FIELDS = `{ name canGroupReceipts ${COMMON_FIELDS} }`
const AcquiringIntegration = generateGqlQueries('AcquiringIntegration', ACQUIRING_INTEGRATION_FIELDS)

const ACQUIRING_INTEGRATION_ACCESS_RIGHT_FIELDS = `{ user { id } integration { id } ${COMMON_FIELDS} }`
const AcquiringIntegrationAccessRight = generateGqlQueries('AcquiringIntegrationAccessRight', ACQUIRING_INTEGRATION_ACCESS_RIGHT_FIELDS)

const ACQUIRING_INTEGRATION_CONTEXT_FIELDS = `{ integration { id } organization { id } state settings ${COMMON_FIELDS} }`
const AcquiringIntegrationContext = generateGqlQueries('AcquiringIntegrationContext', ACQUIRING_INTEGRATION_CONTEXT_FIELDS)

const MULTI_PAYMENT_FIELDS = `{ amount commission currencyCode time cardNumber paymentWay serviceCategory payerEmail serviceCategory transactionId meta status receipts integration { id } ${COMMON_FIELDS} }`
const MultiPayment = generateGqlQueries('MultiPayment', MULTI_PAYMENT_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    AcquiringIntegration,
    AcquiringIntegrationAccessRight,
    AcquiringIntegrationContext,
    MultiPayment,
/* AUTOGENERATE MARKER <EXPORTS> */
}
