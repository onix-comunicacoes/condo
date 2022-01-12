/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadMessages({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    return {
        user: { id: user.id },
    }
}

async function canManageMessages({ authentication: { item: user }, operation }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        return false
    } else if (operation === 'update') {
        return false
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMessages,
    canManageMessages,
}
