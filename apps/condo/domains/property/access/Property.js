/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */
const get = require('lodash/get')
const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { getById, find } = require('@core/keystone/schema')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { uniq, compact } = require('lodash')


async function canReadProperties ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })
        if (!residents.length) return false
        const residentProperties = compact(residents.map(resident => get(resident, 'property')))

        return {
            id_in: uniq(residentProperties),
        }
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
        },
    }
}

async function canManageProperties ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])
        if (!organizationId) return false

        return await checkOrganizationPermission(user.id, organizationId, 'canManageProperties')
    } else if (operation === 'update' && itemId) {
        const property = await getById('Property', itemId)
        if (!property) return false
        const { organization: organizationId } = property

        return await checkOrganizationPermission(user.id, organizationId, 'canManageProperties')
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadProperties,
    canManageProperties,
}