/**
 * Generated by `createschema onboarding.OnBoarding 'completed:Checkbox; stepsTransitions:Json;'`
 */

async function canReadOnBoardings ({ authentication: { item: user } }) {
    if (!user) return false
    if (user.isAdmin) return {}
    return {
        // TODO(codegen): write canReadOnBoardings logic!
    }
}

async function canManageOnBoardings ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return false
    if (user.isAdmin) return true
    if (operation === 'create') {
        // TODO(codegen): write canManageOnBoardings create logic!
        return true
    } else if (operation === 'update') {
        // TODO(codegen): write canManageOnBoardings update logic!
        return true
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOnBoardings,
    canManageOnBoardings,
}
