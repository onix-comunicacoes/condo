/**
 * Generated by `createservice meter.ExportMeterReadingsService --type queries`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const {
    checkOrganizationPermission,
    checkRelatedOrganizationPermission,
} = require('@condo/domains/organization/utils/accessSchema')
const get = require('lodash/get')
const { Organization } = require('@condo/domains/organization/utils/serverSchema')

async function canExportMeterReadings({
    args: {
        data: { where },
    },
    authentication: { item: user },
    context,
}) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    const organizationId = get(where, 'organization.id')
    if (!organizationId) {
        const organizationFromWhere = get(where, 'organization')
        const [relatedFromOrganization] = await Organization.getAll(context, organizationFromWhere)
        if (!relatedFromOrganization) {
            return false
        }
        const canManageRelatedOrganizationTickets = await checkRelatedOrganizationPermission(
            context,
            user.id,
            relatedFromOrganization.id,
            'canManageMeters',
        )
        if (canManageRelatedOrganizationTickets) {
            return true
        }
        return false
    }
    const hasAccess = await checkOrganizationPermission(context, user.id, organizationId, 'canManageMeters')
    return hasAccess
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canExportMeterReadings,
}
