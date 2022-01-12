/**
 * Generated by `createschema ticket.TicketFile 'organization:Text;file?:File;ticket?:Relationship:Ticket:SET_NULL;'`
 */
const get = require('lodash/get')
const {
    queryOrganizationEmployeeFor,
    queryOrganizationEmployeeFromRelatedOrganizationFor,
} = require('@condo/domains/organization/utils/accessSchema')
const { checkRelatedOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { getById } = require('@core/keystone/schema')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadTicketFiles({ authentication: { item: user }, originalInput }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin || user.isSupport) {
        return {}
    }
    if (user.type === RESIDENT) {
        return {
            createdBy: { id: user.id },
        }
    }
    const userId = user.id
    return {
        organization: {
            OR: [queryOrganizationEmployeeFor(userId), queryOrganizationEmployeeFromRelatedOrganizationFor(userId)],
        },
    }
}

async function canManageTicketFiles({ authentication: { item: user }, originalInput, operation, itemId, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        const organizationIdFromTicketFile = get(originalInput, ['organization', 'connect', 'id'])
        // TODO(zuch): need to check connection from resident to organization
        if (user.type === RESIDENT) {
            return true
        }
        if (!organizationIdFromTicketFile) {
            return false
        }
        const canManageRelatedOrganizationTickets = await checkRelatedOrganizationPermission(
            context,
            user.id,
            organizationIdFromTicketFile,
            'canManageTickets',
        )
        if (canManageRelatedOrganizationTickets) {
            return true
        }
        return await checkOrganizationPermission(context, user.id, organizationIdFromTicketFile, 'canManageTickets')
    } else if (operation === 'update') {
        const ticketFile = await getById('TicketFile', itemId)
        if (!ticketFile) {
            return false
        }
        const { ticket, createdBy, organization } = ticketFile
        if (!ticket) {
            // Temp file that wasn't connected to ticket
            return createdBy === user.id
        }
        if (user.type === RESIDENT) {
            return createdBy === user.id
        }
        if (!organization) {
            return false
        }
        const canManageRelatedOrganizationTickets = await checkRelatedOrganizationPermission(
            context,
            user.id,
            organization,
            'canManageTickets',
        )
        if (canManageRelatedOrganizationTickets) {
            return true
        }
        return await checkOrganizationPermission(context, user.id, organization, 'canManageTickets')
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketFiles,
    canManageTicketFiles,
}
