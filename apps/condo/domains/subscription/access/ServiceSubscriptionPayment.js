/**
 * Generated by `createschema subscription.ServiceSubscriptionPayment 'type:Select:default,sbbol; status:Select:processing,done,error,stopped,cancelled; externalId:Text; amount:Decimal; currency:Select:rub; organization:Relationship:Organization:CASCADE; subscription:Relationship:ServiceSubscription:CASCADE; meta:Json;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')

async function canReadServiceSubscriptionPayments ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    
    if (user.isSupport || user.isAdmin) return {}

    return {
        organization: queryOrganizationEmployeeFor(user.id),
    }
}

async function canManageServiceSubscriptionPayments ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadServiceSubscriptionPayments,
    canManageServiceSubscriptionPayments,
}
