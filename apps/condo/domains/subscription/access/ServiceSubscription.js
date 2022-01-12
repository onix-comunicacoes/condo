/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')

async function canReadServiceSubscriptions({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin || user.isSupport) return {}
    return {
        organization: queryOrganizationEmployeeFor(user.id),
    }
}

async function canManageServiceSubscriptions({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        return user.isSupport
    } else if (operation === 'update') {
        return user.isSupport
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadServiceSubscriptions,
    canManageServiceSubscriptions,
}
