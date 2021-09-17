/**
 * Generated by `createschema billing.BillingAccount 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; bindingId:Text; number:Text; unit:Text; raw:Json; meta:Json'`
 */
const faker = require('faker')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithIntegrationAccess } = require('@condo/domains/billing/utils/testSchema')
const { OrganizationEmployee, updateTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { BillingAccount, createTestBillingAccount,
    updateTestBillingAccount, createTestBillingProperty,
    makeContextWithOrganizationAndIntegrationAsAdmin, createTestBillingIntegrationOrganizationContext,
    makeOrganizationIntegrationManager } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')

describe('BillingAccount', () => {
    describe('Constraints', () => {
        test('cant create two BillingAccount with same globalId in one context', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property, {
                globalId: 'cat',
            })

            const { context: context2 } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property2] = await createTestBillingProperty(admin, context2)
            const [billingAccount2] = await createTestBillingAccount(admin, context2, property2, {
                globalId: 'cat',
            })

            expect(billingAccount.id).not.toEqual(billingAccount2.id)
            expect(billingAccount.globalId).toEqual(billingAccount2.globalId)
        })

        test('can create two BillingAccount with same globalId in different contexts', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            await createTestBillingAccount(admin, context, property, {
                globalId: 'cat',
            })
            
            const [property2] = await createTestBillingProperty(admin, context)
            
            await catchErrorFrom(
                async () =>
                    await createTestBillingAccount(admin, context, property2, {
                        globalId: 'cat',
                    }),
                (e) => {
                    expect(e.errors).toBeDefined()
                }
            )
        })
    })

    describe('Create', () => {

        test('admin: create BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)

            expect(billingAccount.context.id).toEqual(context.id)
            expect(billingAccount.property.id).toEqual(property.id)
        })

        test('user: create BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingAccount(client, context, property)
            })
        })

        test('anonymous: create BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClient()

            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestBillingAccount(client, context, property)
            })
        })

        test('integration: create BillingAccount', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()
            const [organization] = await createTestOrganization(adminClient)
            const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integrationClient.integration)
            const [property] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(integrationClient, context, property)

            expect(billingAccount.context.id).toEqual(context.id)
            expect(billingAccount.property.id).toEqual(property.id)
        })

        test('organization integration manager: create BillingAccount', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)

            expect(billingAccount.context.id).toEqual(context.id)
            expect(billingAccount.property.id).toEqual(property.id)
        })

        test('deleted organization integration manager: create BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()

            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)

            const employees = await OrganizationEmployee.getAll(admin, { user: { id: managerUserClient.user.id } })
            expect(employees).toHaveLength(1)
            await updateTestOrganizationEmployee(admin, employees[0].id, { deletedAt: 'true' })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingAccount(managerUserClient, context, property)
            })
        })

        test('blocked organization integration manager: create BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()

            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)

            const employees = await OrganizationEmployee.getAll(admin, { user: { id: managerUserClient.user.id } })
            expect(employees).toHaveLength(1)
            await updateTestOrganizationEmployee(admin, employees[0].id, { isBlocked: true })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingAccount(managerUserClient, context, property)
            })
        })
    })

    describe('Read', () => {
        test('admin: read BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)
            const billingAccounts = await BillingAccount.getAll(admin, { id: billingAccount.id })
            expect(billingAccounts).toHaveLength(1)
        })

        test('integration: read BillingAccount', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()
            const [organization] = await createTestOrganization(adminClient)
            const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integrationClient.integration)
            const [property] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, property)

            const billingAccounts = await BillingAccount.getAll(integrationClient, { id: billingAccount.id })
            expect(billingAccounts).toHaveLength(1)
        })

        test('organization integration manager: read BillingAccount', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
            const billingAccounts = await BillingAccount.getAll(managerUserClient, { id: billingAccount.id })
            expect(billingAccounts).toHaveLength(1)
        })

        test('deleted organization integration manager: read BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const employees = await OrganizationEmployee.getAll(admin, { user: { id: managerUserClient.user.id } })
            expect(employees).toHaveLength(1)
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
            await updateTestOrganizationEmployee(admin, employees[0].id, { deletedAt: 'true' })
            const billingAccounts = await BillingAccount.getAll(managerUserClient, { id: billingAccount.id })
            expect(billingAccounts).toHaveLength(0)
        })

        test('blocked organization integration manager: read BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const employees = await OrganizationEmployee.getAll(admin, { user: { id: managerUserClient.user.id } })
            expect(employees).toHaveLength(1)
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
            await updateTestOrganizationEmployee(admin, employees[0].id, { isBlocked: true })
            const billingAccounts = await BillingAccount.getAll(managerUserClient, { id: billingAccount.id })
            expect(billingAccounts).toHaveLength(0)
        })

        test('user: read BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestBillingAccount(admin, context, property)
            const billingAccounts = await BillingAccount.getAll(client)
            expect(billingAccounts).toHaveLength(0)
        })

        test('anonymous: read BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClient()
            await createTestBillingAccount(admin, context, property)

            await expectToThrowAuthenticationErrorToObjects(async () => {
                await BillingAccount.getAll(client)
            })
        })
    })

    describe('Update', () => {
        test('admin: update BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)

            const randomUnitName = faker.lorem.word()
            const payload = {
                unitName: randomUnitName,
            }
            const [updatedBillingAccount] = await updateTestBillingAccount(admin, billingAccount.id, payload)

            expect(billingAccount.id).toEqual(updatedBillingAccount.id)
            expect(updatedBillingAccount.unitName).toEqual(randomUnitName)
        })

        test('organization integration manager: update BillingAccount', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
            const randomUnitName = faker.lorem.word()
            const payload = {
                unitName: randomUnitName,
            }
            const [updatedBillingAccount] = await updateTestBillingAccount(managerUserClient, billingAccount.id, payload)

            expect(billingAccount.id).toEqual(updatedBillingAccount.id)
            expect(updatedBillingAccount.unitName).toEqual(randomUnitName)
        })

        test('deleted organization integration manager: update BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()

            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)

            const employees = await OrganizationEmployee.getAll(admin, { user: { id: managerUserClient.user.id } })
            expect(employees).toHaveLength(1)
            await updateTestOrganizationEmployee(admin, employees[0].id, { deletedAt: 'true' })

            const payload = {}

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestBillingAccount(managerUserClient, billingAccount.id, payload)
            })
        })

        test('blocked organization integration manager: update BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()

            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)

            const employees = await OrganizationEmployee.getAll(admin, { user: { id: managerUserClient.user.id } })
            expect(employees).toHaveLength(1)
            await updateTestOrganizationEmployee(admin, employees[0].id, { isBlocked: true })

            const payload = {}

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestBillingAccount(managerUserClient, billingAccount.id, payload)
            })
        })

        test('integration: update BillingAccount', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()
            const [organization] = await createTestOrganization(adminClient)
            const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integrationClient.integration)
            const [property] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, property)

            const randomUnitName = faker.lorem.word()
            const payload = {
                unitName: randomUnitName,
            }
            const [updatedBillingAccount] = await updateTestBillingAccount(integrationClient, billingAccount.id, payload)

            expect(billingAccount.context.id).toEqual(context.id)
            expect(billingAccount.property.id).toEqual(property.id)
            expect(updatedBillingAccount.unitName).toEqual(randomUnitName)
        })

        test('user: update BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()

            const payload = {}
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestBillingAccount(client, billingAccount.id, payload)
            })
        })

        test('anonymous: update BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)
            const client = await makeClient()

            const payload = {}
            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestBillingAccount(client, billingAccount.id, payload)
            })
        })
    })

    describe('Delete', () => {
        test('admin: delete BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingAccount.delete(admin, billingAccount.id)
            })
        })

        test('organization integration manager: delete BillingAccount', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingAccount.delete(managerUserClient, billingAccount.id)
            })
        })

        test('user: delete BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)
            const user = await makeClientWithNewRegisteredAndLoggedInUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingAccount.delete(user, billingAccount.id)
            })
        })

        test('anonymous: delete BillingAccount', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingAccount(admin, context, property)
            const client = await makeClient()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingAccount.delete(client, billingAccount.id)
            })
        })
    })
})
