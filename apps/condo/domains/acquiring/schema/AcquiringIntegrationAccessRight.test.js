/**
 * Generated by `createschema acquiring.AcquiringIntegrationAccessRight 'user:Relationship:User:PROTECT;'`
 */

const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')

const {
    AcquiringIntegrationAccessRight,
    createTestAcquiringIntegrationAccessRight,
    updateTestAcquiringIntegrationAccessRight,
    createTestAcquiringIntegration,
} = require('@condo/domains/acquiring/utils/testSchema')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAccessDeniedErrorToObjects,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowValidationFailureError,
} = require('@condo/domains/common/utils/testSchema')
const { createTestBillingIntegration } = require('@condo/domains/billing/utils/testSchema')

describe('AcquiringIntegrationAccessRight', () => {
    describe('CRUD tests', () => {
        describe('create', async () => {
            test("user can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestAcquiringIntegrationAccessRight(client, integration, client.user)
                })
            })
            test("anonymous can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                const anonymousClient = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestAcquiringIntegrationAccessRight(anonymousClient, integration, admin.user)
                })
            })
            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                const support = await makeClientWithSupportUser()
                const rightsClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [integrationAccessRight] = await createTestAcquiringIntegrationAccessRight(
                    support,
                    integration,
                    rightsClient.user,
                )
                expect(integrationAccessRight).toEqual(
                    expect.objectContaining({
                        integration: { id: integration.id },
                        user: { id: rightsClient.user.id },
                    }),
                )
            })
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                const rightsClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [integrationAccessRight] = await createTestAcquiringIntegrationAccessRight(
                    admin,
                    integration,
                    rightsClient.user,
                )
                expect(integrationAccessRight).toEqual(
                    expect.objectContaining({
                        integration: { id: integration.id },
                        user: { id: rightsClient.user.id },
                    }),
                )
            })
        })
        describe('read', async () => {
            test("user can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                const rightsClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestAcquiringIntegrationAccessRight(admin, integration, rightsClient.user)

                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await AcquiringIntegrationAccessRight.getAll(rightsClient)
                })
            })
            test("anonymous can't", async () => {
                const anonymousClient = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await AcquiringIntegrationAccessRight.getAll(anonymousClient)
                })
            })
            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const support = await makeClientWithSupportUser()

                const rights = await AcquiringIntegrationAccessRight.getAll(support)
                expect(rights).toBeDefined()
                expect(rights.length).toBeGreaterThan(0)
            })
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const rights = await AcquiringIntegrationAccessRight.getAll(admin)
                expect(rights).toBeDefined()
                expect(rights.length).toBeGreaterThan(0)
            })
        })
        describe('update', async () => {
            test("user can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                const payload = {}
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestAcquiringIntegrationAccessRight(client, rights.id, payload)
                })
            })
            test("anonymous can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const anonymousClient = await makeClient()

                const payload = {}
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestAcquiringIntegrationAccessRight(anonymousClient, rights.id, payload)
                })
            })
            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const support = await makeClientWithSupportUser()
                const payload = {
                    user: { connect: { id: support.user.id } },
                }
                const [newRights] = await updateTestAcquiringIntegrationAccessRight(support, rights.id, payload)
                expect(newRights).toEqual(
                    expect.objectContaining({
                        user: { id: support.user.id },
                    }),
                )
            })
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                const payload = {
                    user: { connect: { id: client.user.id } },
                }
                const [newRights] = await updateTestAcquiringIntegrationAccessRight(admin, rights.id, payload)
                expect(newRights).toEqual(
                    expect.objectContaining({
                        user: { id: client.user.id },
                    }),
                )
            })
        })
        describe('hard delete', async () => {
            test("user can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationAccessRight.delete(client, rights.id)
                })
            })
            test("anonymous can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                const anonymousClient = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationAccessRight.delete(anonymousClient, rights.id)
                })
            })
            test("support can't", async () => {
                const support = await makeClientWithSupportUser()
                const [billingIntegration] = await createTestBillingIntegration(support)
                const [integration] = await createTestAcquiringIntegration(support, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(support, integration, support.user)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationAccessRight.delete(support, rights.id)
                })
            })
            test("admin can't", async () => {
                const admin = await makeLoggedInAdminClient()
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, admin.user)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationAccessRight.delete(admin, rights.id)
                })
            })
        })
    })
    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            const admin = await makeLoggedInAdminClient()
            const [billingIntegration] = await createTestBillingIntegration(admin)
            const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
            const rightsClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await expectToThrowValidationFailureError(async () => {
                await createTestAcquiringIntegrationAccessRight(admin, integration, rightsClient.user, {
                    dv: 2,
                })
            }, DV_UNKNOWN_VERSION_ERROR)
            const [rights] = await createTestAcquiringIntegrationAccessRight(admin, integration, rightsClient.user)
            await expectToThrowValidationFailureError(async () => {
                await updateTestAcquiringIntegrationAccessRight(admin, rights.id, {
                    dv: 2,
                })
            }, DV_UNKNOWN_VERSION_ERROR)
        })
    })
})
