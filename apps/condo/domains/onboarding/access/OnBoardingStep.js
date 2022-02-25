/**
 * Generated by `createschema onboarding.OnBoardingStep 'icon:Text; title:Text; description:Text; action:Select:create,read,update,delete; entity:Text; onBoarding:Relationship:OnBoarding:SET_NULL;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadOnBoardingSteps ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return {}
}

async function canManageOnBoardingSteps ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOnBoardingSteps,
    canManageOnBoardingSteps,
}
