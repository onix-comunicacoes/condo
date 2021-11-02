/**
 * Generated by `createschema resident.ServiceConsumer 'resident:Relationship:Resident:CASCADE; billingAccount?:Relationship:BillingAccount:SET_NULL; accountNumber:Text;'`
 */

const faker = require('faker')
const { addResidentAccess } = require('@condo/domains/user/utils/testSchema')
const { createTestResident } = require('../utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestBillingAccount, createTestBillingProperty, makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployee, createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects } = require('@condo/domains/common/utils/testSchema')
const { makeClient } = require('@core/keystone/test.utils')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { createTestServiceConsumer, updateTestServiceConsumer, makeClientWithServiceConsumer } = require('@condo/domains/resident/utils/testSchema')
const { ServiceConsumer } = require('../utils/testSchema')


describe('ServiceConsumer', () => {

    describe('Create',  () => {
        it('can be created by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)

            const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
            const [consumer] = await createTestServiceConsumer(adminClient, resident, { billingAccount: { connect: { id: billingAccount.id } } })
            expect(consumer.resident.id).toEqual(resident.id)
        })

        it('cannot be created by regular user', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [anotherOrganization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization)
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)
            const [resident] = await createTestResident(adminClient, userClient.user, anotherOrganization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestServiceConsumer(userClient, resident)
            })
        })

        it('cannot be created by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const anonymous = await makeClient()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestServiceConsumer(anonymous, resident, { billingAccount: { connect: { id: billingAccount.id } } })
            })
        })
    })

    describe('SoftDelete', () => {
        it('can be soft-deleted by user with type === resident if this is his own serviceConsumer', async () => {
            const client1 = await makeClientWithServiceConsumer()

            const [deleted] = await updateTestServiceConsumer(client1, client1.serviceConsumer.id, { deletedAt: 'true' })
            expect(deleted.id).toEqual(client1.serviceConsumer.id)
            expect(deleted.deletedAt).toBeDefined()
        })

        it('cannot be soft-deleted by user with type === resident if this is not his own serviceConsumer', async () => {
            const client1 = await makeClientWithServiceConsumer()
            const client2 = await makeClientWithServiceConsumer()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestServiceConsumer(client1, client2.serviceConsumer.id, { deletedAt: 'true' })
            })
        })
    })

    describe('Update', () => {
        it('can be updated by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClientWithServiceConsumer()

            const newAccountNumber = faker.random.alphaNumeric(8)

            const [updatedConsumer] = await updateTestServiceConsumer(adminClient, client.serviceConsumer.id, { accountNumber: newAccountNumber })
            expect(updatedConsumer.id).toEqual(client.serviceConsumer.id)
            expect(updatedConsumer.accountNumber).toEqual(newAccountNumber)
        })

        it('cannot be updated by user with type === resident even if this is his own serviceConsumer', async () => {
            const client = await makeClientWithServiceConsumer()

            await addResidentAccess(client.user)
            const newAccountNumber = faker.random.alphaNumeric(8)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestServiceConsumer(client, client.serviceConsumer.id, { accountNumber: newAccountNumber })
            })
        })

        it('cannot be updated by user with type === resident', async () => {
            const client1 = await makeClientWithServiceConsumer()
            const client2 = await makeClientWithServiceConsumer()

            await addResidentAccess(client1.user)
            await addResidentAccess(client2.user)

            const newAccountNumber = faker.random.alphaNumeric(8)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestServiceConsumer(client2, client1.serviceConsumer.id, { accountNumber: newAccountNumber })
            })
        })

        it('cannot be updated by other users', async () => {
            const client = await makeClientWithServiceConsumer()

            const newAccountNumber = faker.random.alphaNumeric(8)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestServiceConsumer(client, client.serviceConsumer.id, { accountNumber: newAccountNumber })
            })
        })

        it('cannot be updated by anonymous', async () => {
            const anonymousClient = await makeClient()
            const client = await makeClientWithServiceConsumer()

            const newAccountNumber = faker.random.alphaNumeric(8)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestServiceConsumer(anonymousClient, client.serviceConsumer.id, { accountNumber: newAccountNumber })
            })
        })
    })

    describe('Read', () => {
        it('can be read by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            await makeClientWithServiceConsumer()

            const objs = await ServiceConsumer.getAll(adminClient, {})
            expect(objs.length >= 1).toBeTruthy()
        })

        it('can be read by user with type === resident who created it', async () => {
            const client = await makeClientWithServiceConsumer()
            await makeClientWithServiceConsumer() // Create second service consumer

            const objs = await ServiceConsumer.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs.length === 1).toBeTruthy()
            expect(objs[0].id).toMatch(client.serviceConsumer.id)
        })

        it('cannot be read by anonymous', async () => {
            const anonymous = await makeClient()
            await makeClientWithServiceConsumer()

            await expectToThrowAccessDeniedErrorToObjects(async () => {
                await ServiceConsumer.getAll(anonymous, {}, { sortBy: ['updatedAt_DESC'] })
            })
        })
    })

    describe('Delete', () => {
        it('cannot be deleted by anybody', async () => {
            const client = await makeClientWithServiceConsumer()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await ServiceConsumer.delete(client, client.serviceConsumer.id)
            })
        })
    })

    describe('Real-life cases', () => {
        /**
         * To send meter readings resident should have service consumer linked to the resident's organization
         * To pay resident should have service consumer with receipts (with billing account and billing context) and acquiring (acquiring context)
         */

        test('Resident tries to send meter readings', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [anotherOrganization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization)
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)
            const [resident] = await createTestResident(adminClient, userClient.user, anotherOrganization, userClient.property)

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)

            await createTestServiceConsumer(userClient, resident, billingAccount)
        })

        test('Resident who can send meter readings tries to pay', async () => {
            console.log('skipped')
        })

        test('Resident tries to pay', async () => {
            console.log('skipped')
        })

        test('Resident tries to pay for different payment documents using different service consumers', async () => {
            console.log('skipped')
        })

        test('Resident\'s organization changes billing or acquiring integrations', async () => {
            console.log('skipped')
        })

        test('Resident who can pay tries to send meter readings', async () => {
            console.log('skipped')
        })
    })
})