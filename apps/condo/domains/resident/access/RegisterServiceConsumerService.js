/**
 * Generated by `createservice resident.RegisterServiceConsumerService --type mutations`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { RESIDENT } = require('@condo/domains/user/constants/common')

async function canRegisterServiceConsumer ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return user.isAdmin || user.type === RESIDENT
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canRegisterServiceConsumer,
}