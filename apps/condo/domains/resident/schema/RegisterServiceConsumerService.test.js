/**
 * Generated by `createservice resident.RegisterServiceConsumerService --type mutations`
 */

const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')

const { registerConsumerServiceByTestClient } = require('@condo/domains/resident/utils/testSchema')
 
describe('RegisterServiceConsumerService', () => {
    test('user: execute', async () => {
        const client = await makeClient()  // TODO(codegen): use truly useful client!
        const payload = {}  // TODO(codegen): change the 'user: update RegisterServiceConsumerService' payload
        const [data, attrs] = await registerConsumerServiceByTestClient(client, payload)
        // TODO(codegen): write user expect logic
        throw new Error('Not implemented yet')
    })
 
    test('anonymous: execute', async () => {
        const client = await makeClient()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await registerConsumerServiceByTestClient(client)
        })
    })
 
    test('admin: execute', async () => {
        const admin = await makeLoggedInAdminClient()
        const payload = {}  // TODO(codegen): change the 'user: update RegisterServiceConsumerService' payload
        const [data, attrs] = await registerConsumerServiceByTestClient(admin, payload)
        // TODO(codegen): write admin expect logic
        throw new Error('Not implemented yet')
    })
})