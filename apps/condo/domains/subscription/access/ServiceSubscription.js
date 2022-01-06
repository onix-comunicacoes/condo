/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { USER_SCHEMA_NAME } = require('@condo/domains/common/constants/utils')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')

async function canReadServiceSubscriptions ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false
    if (listKey === USER_SCHEMA_NAME) {
        if (item.isSupport || item.isAdmin) return {}
        return {
            organization: queryOrganizationEmployeeFor(item.id),
        }
    }
    return false
}

async function canManageServiceSubscriptions ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false
    if (listKey === USER_SCHEMA_NAME) {
        if (item.isSupport || item.isAdmin) return true
        return false
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
