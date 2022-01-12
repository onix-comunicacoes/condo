/**
 * Generated by `createservice user.ChangePhoneNumberResidentUserService`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canChangePhoneNumberResidentUser({ authentication: { item: user } }) {
    if (!user) {
        return throwAuthenticationError()
    }
    if (!user.isPhoneVerified) {
        return false
    }
    if (user.type !== 'resident') {
        return false
    }
    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canChangePhoneNumberResidentUser,
}
