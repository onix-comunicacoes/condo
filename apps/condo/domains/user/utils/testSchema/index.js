/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const { v4: uuid } = require('uuid')
const { getRandomString, makeClient, makeLoggedInClient, makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')
const { User: UserGQL, UserAdmin: UserAdminGQL, REGISTER_NEW_USER_MUTATION } = require('@condo/domains/user/gql')
const { ConfirmPhoneAction: ConfirmPhoneActionGQL } = require('@condo/domains/user/gql')
const { generateSmsCode } = require('@condo/domains/user/utils/serverSchema')
const { ForgotPasswordAction: ForgotPasswordActionGQL } = require('@condo/domains/user/gql')
const { SIGNIN_AS_USER_MUTATION } = require('@condo/domains/user/gql')
const { REGISTER_NEW_SERVICE_USER_MUTATION } = require('@condo/domains/user/gql')
const { SEND_MESSAGE_TO_SUPPORT_MUTATION } = require('@condo/domains/user/gql')
const { RESET_USER_MUTATION } = require('@condo/domains/user/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const User = generateGQLTestUtils(UserGQL)
const UserAdmin = generateGQLTestUtils(UserAdminGQL)

const createTestEmail = () => ('test.' + getRandomString() + '@example.com').toLowerCase()
const createTestPhone = () => faker.phone.phoneNumber('+79#########')
const createTestLandlineNumber = () => faker.phone.phoneNumber('+7343#######')

const {
    SMS_CODE_TTL,
    CONFIRM_PHONE_ACTION_EXPIRY,
} = require('@condo/domains/user/constants/common')
const { RESIDENT, STAFF } = require('@condo/domains/user/constants/common')

async function createTestUser (client, extraAttrs = {},  { raw = false } = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const phone = createTestPhone()
    const password = getRandomString()
    const meta = {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    }

    const attrs = {
        dv: 1,
        sender,
        name, email, phone,
        password, meta,
        type: STAFF,
        ...extraAttrs,
    }
    const result = await User.create(client, attrs, { raw })
    if (raw) return result
    return [result, attrs]
}

async function updateTestUser (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await User.update(client, id, attrs)
    return [obj, attrs]
}

async function registerNewUser (client, extraAttrs = {}, { raw = false } = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const password = getRandomString()
    const phone = createTestPhone()
    const meta = {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    }
    const attrs = {
        dv: 1,
        sender,
        name,
        email,
        phone,
        password, meta,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_NEW_USER_MUTATION, {
        data: attrs,
    })
    if (raw) return { data, errors }
    expect(errors).toEqual(undefined)
    return [data.user, attrs]
}

async function makeClientWithNewRegisteredAndLoggedInUser () {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithSupportUser() {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    await addSupportAccess(user)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithResidentUser() {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    await addResidentAccess(user)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithStaffUser() {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    await addStaffAccess(user)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function addAdminAccess (user) {
    const admin = await makeLoggedInAdminClient()
    await User.update(admin, user.id, { isAdmin: true })
}

async function addSupportAccess (user) {
    const admin = await makeLoggedInAdminClient()
    await User.update(admin, user.id, { isSupport: true})
}

async function addResidentAccess (user) {
    const admin = await makeLoggedInAdminClient()
    await User.update(admin, user.id, { type: RESIDENT })
}

async function addStaffAccess (user) {
    const admin = await makeLoggedInAdminClient()
    await User.update(admin, user.id, { type: STAFF })
}

const ConfirmPhoneAction = generateGQLTestUtils(ConfirmPhoneActionGQL)
const ForgotPasswordAction = generateGQLTestUtils(ForgotPasswordActionGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestConfirmPhoneAction (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const now = Date.now()
    const attributes = {
        token: uuid(),
        phone: createTestPhone(),
        smsCode: generateSmsCode(),
        smsCodeRequestedAt: new Date(now).toISOString(),
        smsCodeExpiresAt: new Date(now + SMS_CODE_TTL * 1000).toISOString(),
        requestedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + CONFIRM_PHONE_ACTION_EXPIRY * 1000).toISOString(),
    }
    const attrs = {
        dv: 1,
        sender,
        ...attributes,
        ...extraAttrs,
    }
    const obj = await ConfirmPhoneAction.create(client, attrs)
    return [obj, attrs]
}

async function updateTestConfirmPhoneAction (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ConfirmPhoneAction.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestForgotPasswordAction (client, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!user || !user.id) throw new Error('no user.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const now = Date.now()
    const attrs = {
        dv: 1,
        sender,
        user: { connect: { id: user.id } },
        token: uuid(),
        requestedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + CONFIRM_PHONE_ACTION_EXPIRY * 1000).toISOString(),
        ...extraAttrs,
    }
    const obj = await ForgotPasswordAction.create(client, attrs)

    return [obj, attrs]
}

async function updateTestForgotPasswordAction (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ForgotPasswordAction.update(client, id, attrs)
    return [obj, attrs]
}

async function signinAsUserByTestClient(client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    if (!id) throw new Error('No user id passed')
    const attrs = {
        dv: 1,
        sender,
        id,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(SIGNIN_AS_USER_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function resetUserByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(RESET_USER_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function registerNewServiceUserByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const meta = {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    }
    const attrs = {
        dv: 1,
        sender,
        name,
        email,
        meta,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_NEW_SERVICE_USER_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function supportSendMessageToSupportByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(SEND_MESSAGE_TO_SUPPORT_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    User,
    UserAdmin,
    createTestUser,
    updateTestUser,
    registerNewUser,
    makeLoggedInClient,
    makeClientWithResidentUser,
    makeClientWithStaffUser,
    makeClientWithSupportUser,
    makeClientWithNewRegisteredAndLoggedInUser,
    addAdminAccess,
    addSupportAccess,
    addResidentAccess,
    addStaffAccess,
    createTestEmail,
    createTestPhone,
    createTestLandlineNumber,
    ConfirmPhoneAction,
    createTestConfirmPhoneAction,
    updateTestConfirmPhoneAction,
    ForgotPasswordAction,
    createTestForgotPasswordAction,
    updateTestForgotPasswordAction,
    signinAsUserByTestClient,
    registerNewServiceUserByTestClient,
    resetUserByTestClient,
    supportSendMessageToSupportByTestClient,
/* AUTOGENERATE MARKER <EXPORTS> */
}
