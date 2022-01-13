// @ts-nocheck
/**
 * Generated by `createschema notification.PushToken PushToken`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadPushTokens ({ authentication: { item: user } }) {
    // if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return {}
    return {
        // TODO(codegen): write canReadPushTokens logic!
    }
}

async function canManagePushTokens ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (user && user.deletedAt) return false
    if (user && user.isAdmin) return true
    if (operation === 'create') {
        // TODO(codegen): write canManagePushTokens create logic!
        return true
    } else if (operation === 'update') {
        if (!user) return throwAuthenticationError()
        // TODO(codegen): write canManagePushTokens update logic!
        return true
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadPushTokens,
    canManagePushTokens,
}
