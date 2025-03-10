const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const {
    acceptOrRejectOrganizationInviteById,
    acceptOrRejectOrganizationInviteByCode,
    inviteNewOrganizationEmployee,
    makeClientWithRegisteredOrganization,
} = require('../utils/testSchema/Organization')
const { makeClient, makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { GET_ORGANIZATION_EMPLOYEE_BY_ID_WITH_INVITE_CODE_QUERY } = require('../utils/testSchema/OrganizationEmployee')
const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('../utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('../../common/utils/testSchema')

describe('AcceptOrRejectOrganizationInviteService', () => {
    describe('acceptOrRejectOrganizationInviteById', () => {
        describe('User', () => {
            test('Accept and reject', async () => {
                const client1 = await makeClientWithRegisteredOrganization()
                const client2 = await makeClientWithNewRegisteredAndLoggedInUser()

                const [invite] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)
                const [accepted] = await acceptOrRejectOrganizationInviteById(client2, invite)

                expect(accepted).toEqual(expect.objectContaining({
                    isAccepted: true,
                    isRejected: false,
                }))

                const [rejected] = await acceptOrRejectOrganizationInviteById(client2, invite, { isRejected: true })

                expect(rejected).toEqual(expect.objectContaining({
                    isRejected: true,
                }))
            })
        })


        describe('Anonymous', () => {
            it('throws access denied error', async () => {
                const client1 = await makeClientWithRegisteredOrganization()
                const client2 = await makeClientWithNewRegisteredAndLoggedInUser()
                const anonymous = await makeClient()

                const [invite] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await acceptOrRejectOrganizationInviteById(anonymous, invite)
                })
            })
        })
    })


    describe('acceptOrRejectOrganizationInviteByCode', () => {
        describe('User', () => {
            it('Returns accepted OrganizationEmployee connected to specified user when `isAccepted` is provided', async () => {
                const client1 = await makeClientWithRegisteredOrganization()
                const client2 = await makeClientWithNewRegisteredAndLoggedInUser()
                const adminClient = await makeLoggedInAdminClient()

                const [role] = await createTestOrganizationEmployeeRole(adminClient, client1.organization)
                // Imitate an employee without user, that will be connected in tested mutation
                const [employee] = await createTestOrganizationEmployee(adminClient, client1.organization, client1.user, role, { user: null })
                const { data: { objs: [{ inviteCode }] } } = await adminClient.query(GET_ORGANIZATION_EMPLOYEE_BY_ID_WITH_INVITE_CODE_QUERY, { id: employee.id })
                const [result] = await acceptOrRejectOrganizationInviteByCode(client2, inviteCode, {
                    isAccepted: true,
                })

                expect(result).toMatchObject({
                    isAccepted: true,
                    isRejected: false,
                    user: {
                        id: client2.user.id,
                    },
                })
            })

            it('Returns rejected OrganizationEmployee invitation when `isRejected` is provided', async () => {
                const client1 = await makeClientWithRegisteredOrganization()
                const client2 = await makeClientWithNewRegisteredAndLoggedInUser()
                const adminClient = await makeLoggedInAdminClient()

                const [role] = await createTestOrganizationEmployeeRole(adminClient, client1.organization)
                // Imitate an employee without user, that will be connected in tested mutation
                const [employee] = await createTestOrganizationEmployee(adminClient, client1.organization, client1.user, role, { user: null })
                const { data: { objs: [{ inviteCode }] } } = await adminClient.query(GET_ORGANIZATION_EMPLOYEE_BY_ID_WITH_INVITE_CODE_QUERY, { id: employee.id })
                const [result] = await acceptOrRejectOrganizationInviteByCode(client2, inviteCode, {
                    isRejected: true,
                })

                expect(result).toMatchObject({
                    isAccepted: false,
                    isRejected: true,
                })
            })

            it('Throws "Access denied" error when an employee is already connected to a user', async () => {
                const client1 = await makeClientWithRegisteredOrganization()
                const client2 = await makeClientWithNewRegisteredAndLoggedInUser()
                const adminClient = await makeLoggedInAdminClient()

                // const [invite] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, client1.organization)
                // Imitate an employee without user, that will be connected in tested mutation
                const [employee] = await createTestOrganizationEmployee(adminClient, client1.organization, client1.user, role)
                const { data: { objs: [{ inviteCode }] } } = await adminClient.query(GET_ORGANIZATION_EMPLOYEE_BY_ID_WITH_INVITE_CODE_QUERY, { id: employee.id })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await acceptOrRejectOrganizationInviteByCode(client2, inviteCode, {
                        isAccepted: true,
                    })
                })
            })
        })

        describe('Anonymous', () => {
            it('throws "Access denied" error', async () => {
                const client1 = await makeClientWithRegisteredOrganization()
                const adminClient = await makeLoggedInAdminClient()
                const anonymousClient = await makeClient()

                const [role] = await createTestOrganizationEmployeeRole(adminClient, client1.organization)
                const [employee] = await createTestOrganizationEmployee(adminClient, client1.organization, client1.user, role, { user: null })
                const { data: { objs: [{ inviteCode }] } } = await adminClient.query(GET_ORGANIZATION_EMPLOYEE_BY_ID_WITH_INVITE_CODE_QUERY, { id: employee.id })

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await acceptOrRejectOrganizationInviteByCode(anonymousClient, inviteCode, {
                        isAccepted: true,
                    })
                })
            })
        })
    })
})
