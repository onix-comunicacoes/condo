/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { AcquiringIntegration: AcquiringIntegrationGQL } = require('@condo/domains/acquiring/gql')
const { AcquiringIntegrationAccessRight: AcquiringIntegrationAccessRightGQL } = require('@condo/domains/acquiring/gql')
const { AcquiringIntegrationContext: AcquiringIntegrationContextGQL } = require('@condo/domains/acquiring/gql')
const { MultiPayment: MultiPaymentGQL } = require('@condo/domains/acquiring/gql')
const { Payment: PaymentGQL } = require('@condo/domains/acquiring/gql')
const { REGISTER_MULTI_PAYMENT_MUTATION } = require('@condo/domains/acquiring/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const AcquiringIntegration = generateServerUtils(AcquiringIntegrationGQL)
const AcquiringIntegrationAccessRight = generateServerUtils(AcquiringIntegrationAccessRightGQL)
const AcquiringIntegrationContext = generateServerUtils(AcquiringIntegrationContextGQL)
const MultiPayment = generateServerUtils(MultiPaymentGQL)
const Payment = generateServerUtils(PaymentGQL)
async function registerMultiPayment(context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_MULTI_PAYMENT_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerMultiPayment',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    AcquiringIntegration,
    AcquiringIntegrationAccessRight,
    AcquiringIntegrationContext,
    MultiPayment,
    Payment,
    registerMultiPayment,
    /* AUTOGENERATE MARKER <EXPORTS> */
}
