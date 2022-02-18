/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */
const dayjs = require('dayjs')
const faker = require('faker')

const { NUMBER_RE, UUID_RE, DATETIME_RE, makeClient, makeLoggedInAdminClient } = require('@core/keystone/test.utils')

const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowUserInputError,
} = require('@condo/domains/common/utils/testSchema')
const { sleep } = require('@condo/domains/common/utils/sleep')

const { createTestContact } = require('@condo/domains/contact/utils/testSchema')

const {
    createTestOrganizationLink,
    createTestOrganizationWithAccessToAnotherOrganization,
    createTestOrganization,
    createTestOrganizationEmployeeRole,
    updateTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')

const { Ticket, createTestTicket, updateTestTicket } = require('@condo/domains/ticket/utils/testSchema')

const {
    makeClientWithProperty,
    createTestProperty,
    updateTestProperty,
    makeClientWithResidentAccessAndProperty,
} = require('@condo/domains/property/utils/testSchema')

const { createTestResident } = require('@condo/domains/resident/utils/testSchema')

const { createTestPhone } = require('@condo/domains/user/utils/testSchema')

describe('Ticket', () => {
    describe('Crud', () => {
        test('admin: creates ticket with clientPhone value, so contact is being created and connected', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithProperty()
            const fields = {
                clientName: faker.name.firstName(),
                clientPhone: createTestPhone(),
            }
            const [obj] = await createTestTicket(admin, client.organization, client.property, fields)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.contact.id).toMatch(UUID_RE)
        })

        test('admin: updates clientPhone value within ticket, so contact is being created and connected', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithProperty()
            const fields = {
                clientName: faker.name.firstName(),
                clientPhone: createTestPhone(),
            }
            const [obj] = await createTestTicket(admin, client.organization, client.property, fields)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.contact.id).toMatch(UUID_RE)

            const fields1 = {
                clientPhone: createTestPhone(),
            }

            const [obj1] = await updateTestTicket(client, obj.id, fields1)

            expect(obj1.clientPhone).toEqual(fields1.clientPhone)
            expect(obj1.contact.id).not.toEqual(obj.contact.id)
        })

        test('user: create Ticket', async () => {
            const client = await makeClientWithProperty()
            const [contact] = await createTestContact(client, client.organization, client.property)
            const fields = { contact: { connect: { id: contact.id } } }
            const [obj, attrs] = await createTestTicket(client, client.organization, client.property, fields)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.organization).toEqual(expect.objectContaining({ id: client.organization.id }))
            expect(String(obj.number)).toMatch(NUMBER_RE)
            expect(obj.source).toEqual(expect.objectContaining({ id: attrs.source.connect.id }))
            expect(obj.sourceMeta).toEqual(null)
            expect(obj.classifier).toEqual(expect.objectContaining({ id: attrs.classifier.connect.id }))
            expect(obj.property).toEqual(expect.objectContaining({ id: client.property.id }))
            expect(obj.propertyAddress).toEqual(client.property.address)
            expect(obj.propertyAddressMeta).toEqual(client.property.addressMeta)
            expect(obj.status).toEqual(expect.objectContaining({ id: attrs.status.connect.id }))
            expect(obj.statusReopenedCounter).toEqual(0)
            expect(obj.statusReason).toEqual(null)
            expect(obj.statusUpdatedAt).toBeNull()
            expect(obj.details).toEqual(attrs.details)
            expect(obj.isPaid).toEqual(false)
            expect(obj.isEmergency).toEqual(false)
            expect(obj.isWarranty).toEqual(false)
            expect(obj.meta).toEqual(null)
            expect(obj.client).toEqual(null)
            expect(obj.contact).toEqual(expect.objectContaining({ id: attrs.contact.connect.id }))
            expect(obj.operator).toEqual(null)
            expect(obj.assignee).toEqual(null)
            expect(obj.executor).toEqual(null)
            expect(obj.watchers).toEqual([])
        })

        test('user: create Ticket without status', async () => {
            const client = await makeClientWithProperty()
            const [obj] = await createTestTicket(client, client.organization, client.property, { status: null })
            const TICKET_OPEN_STATUS_ID = '6ef3abc4-022f-481b-90fb-8430345ebfc2'

            expect(obj.status).toEqual(expect.objectContaining({ id: TICKET_OPEN_STATUS_ID }))
        })

        test('user with resident type without resident: cannot create Ticket', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(userClient, userClient.organization, userClient.property)
            })
        })

        test('resident: can create Ticket and client info save in new ticket', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const unitName = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })

            const [obj] = await createTestTicket(userClient, userClient.organization, userClient.property, {
                unitName,
            })

            const user = userClient.user
            const { name, email, phone } = userClient.userAttrs

            expect(obj.client.id).toEqual(user.id)
            expect(obj.clientName).toEqual(name)
            expect(obj.clientPhone).toEqual(phone)
            expect(obj.clientEmail).toEqual(email)
        })

        test('user with 2 residents: can create Ticket for each resident', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const [organization] = await createTestOrganization(admin)
            const [property] = await createTestProperty(admin, organization)
            const unitName1 = faker.random.alphaNumeric(5)
            const unitName2 = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName: unitName1,
            })
            await createTestResident(admin, userClient.user, organization, property, {
                unitName: unitName2,
            })

            const [ticket1] = await createTestTicket(userClient, userClient.organization, userClient.property, {
                unitName: unitName1,
            })
            const [ticket2] = await createTestTicket(userClient, organization, property, {
                unitName: unitName2,
            })

            expect(ticket1.id).toMatch(UUID_RE)
            expect(ticket2.id).toMatch(UUID_RE)
        })

        test('resident: cannot create Ticket without unitName', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const unitName = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(userClient, userClient.organization, userClient.property)
            })
        })

        test('resident: cannot create Ticket in other unitName', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const unitName1 = faker.random.alphaNumeric(5)
            const unitName2 = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName: unitName1,
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(userClient, userClient.organization, userClient.property, {
                    unitName: unitName2,
                })
            })
        })

        test('resident: cannot create Ticket in other property', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const [property] = await createTestProperty(admin, userClient.organization)
            const unitName = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(userClient, userClient.organization, property, {
                    unitName,
                })
            })
        })

        test('resident: can update his Ticket details', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const unitName = faker.random.alphaNumeric(5)
            const newDetails = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })

            const [ticket] = await createTestTicket(userClient, userClient.organization, userClient.property, {
                unitName,
            })

            const [updatedTicket] = await updateTestTicket(userClient, ticket.id, {
                details: newDetails,
            })

            expect(ticket.id).toEqual(updatedTicket.id)
            expect(updatedTicket.details).toEqual(newDetails)
        })

        test('resident: cannot update his Ticket fields other than details', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const unitName = faker.random.alphaNumeric(5)
            const unitName2 = faker.random.alphaNumeric(5)
            const newDetails = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })

            const [ticket] = await createTestTicket(userClient, userClient.organization, userClient.property, {
                unitName,
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicket(userClient, ticket.id, {
                    details: newDetails,
                    unitName: unitName2,
                })
            })
        })

        test('resident: cannot update not his Ticket', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const userClient2 = await makeClientWithResidentAccessAndProperty()
            const unitName = faker.random.alphaNumeric(5)
            const unitName2 = faker.random.alphaNumeric(5)
            const newDetails = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })
            await createTestResident(admin, userClient2.user, userClient.organization, userClient.property, {
                unitName: unitName2,
            })

            const [ticket] = await createTestTicket(userClient, userClient.organization, userClient.property, {
                unitName,
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicket(userClient2, ticket.id, {
                    details: newDetails,
                    unitName: unitName2,
                })
            })
        })

        test('resident: can read his Tickets', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const unitName = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })
            const [ticket] = await createTestTicket(userClient, userClient.organization, userClient.property, {
                unitName,
            })
            const [readTicket] = await Ticket.getAll(userClient, { id: ticket.id })

            expect(readTicket.id).toEqual(ticket.id)
        })

        test('resident: cannot read not his Tickets', async () => {
            const admin = await makeLoggedInAdminClient()
            const userClient = await makeClientWithResidentAccessAndProperty()
            const userInOtherProperty = await makeClientWithResidentAccessAndProperty()
            const userInOtherUnit = await makeClientWithResidentAccessAndProperty()
            const unitName = faker.random.alphaNumeric(5)
            const unitName2 = faker.random.alphaNumeric(5)
            await createTestResident(admin, userClient.user, userClient.organization, userClient.property, {
                unitName,
            })
            await createTestResident(admin, userInOtherProperty.user, userInOtherProperty.organization, userInOtherProperty.property, {
                unitName,
            })
            await createTestResident(admin, userInOtherUnit.user, userClient.organization, userClient.property, {
                unitName: unitName2,
            })
            const [ticketInOtherProperty] = await createTestTicket(userInOtherProperty, userInOtherProperty.organization, userInOtherProperty.property, {
                unitName,
            })
            const [ticketInOtherUnit] = await createTestTicket(userInOtherUnit, userClient.organization, userClient.property, {
                unitName: unitName2,
            })

            const readTickets = await Ticket.getAll(userClient, { id_in: [ticketInOtherProperty.id, ticketInOtherUnit.id] })

            expect(readTickets).toHaveLength(0)
        })

        test('anonymous: create Ticket', async () => {
            const client1 = await makeClientWithProperty()
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestTicket(client, client1.organization, client1.property)
            })
        })

        test('user: read Ticket', async () => {
            const client = await makeClientWithProperty()
            const [obj, attrs] = await createTestTicket(client, client.organization, client.property)
            const objs = await Ticket.getAll(client)
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(obj.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].newId).toEqual(null)
            expect(objs[0].deletedAt).toEqual(null)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            expect(objs[0].createdAt).toMatch(obj.createdAt)
            expect(objs[0].updatedAt).toMatch(obj.updatedAt)
        })

        test('user: no access to another organization ticket', async () => {
            const hacker = await makeClientWithProperty()
            const client = await makeClientWithProperty()
            const [obj] = await createTestTicket(client, client.organization, client.property)

            const objs = await Ticket.getAll(hacker)
            expect(objs).toHaveLength(0)

            const objsFilteredById = await Ticket.getAll(hacker, { id: obj.id })
            expect(objsFilteredById).toHaveLength(0)
        })

        test('anonymous: read Ticket', async () => {
            const client = await makeClient()

            await expectToThrowAuthenticationErrorToObjects(async () => {
                await Ticket.getAll(client)
            })
        })

        test('user: update Ticket', async () => {
            const client = await makeClientWithProperty()
            const payload = { details: 'new data' }
            const [objCreated] = await createTestTicket(client, client.organization, client.property)

            const [objUpdated, attrs] = await updateTestTicket(client, objCreated.id, payload)

            expect(objUpdated.id).toEqual(objCreated.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            expect(objUpdated.details).toEqual(payload.details)
            expect(objUpdated.organization).toEqual(expect.objectContaining({ id: client.organization.id }))
            expect(objUpdated.number).toEqual(objCreated.number)
            // TODO(pahaz): check others fields ...
        })

        test('user: set ticket assignee', async () => {
            const client = await makeClientWithProperty()
            const [objCreated] = await createTestTicket(client, client.organization, client.property)

            const payload = { details: 'new data', assignee: { connect: { id: client.user.id } } }
            const [objUpdated] = await updateTestTicket(client, objCreated.id, payload)

            expect(objUpdated.assignee).toEqual(expect.objectContaining({ id: client.user.id }))
            const IN_PROGRESS = 'aa5ed9c2-90ca-4042-8194-d3ed23cb7919'
            expect(objUpdated.status).toEqual(expect.objectContaining({ id: IN_PROGRESS }))
        })

        test('user: set the same ticket number', async () => {
            const client = await makeClientWithProperty()
            const [objCreated] = await createTestTicket(client, client.organization, client.property)
            const payload = { number: objCreated.number }
            const [objUpdated] = await updateTestTicket(client, objCreated.id, payload)

            expect(objUpdated.id).toEqual(objCreated.id)
            expect(objUpdated.number).toEqual(objCreated.number)
        })

        test('anonymous: update Ticket', async () => {
            const client1 = await makeClientWithProperty()
            const client = await makeClient()
            const payload = { details: 'new data' }
            const [objCreated] = await createTestTicket(client1, client1.organization, client1.property)
            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestTicket(client, objCreated.id, payload)
            })
        })

        test('user: delete Ticket', async () => {
            const client = await makeClientWithProperty()
            const [objCreated] = await createTestTicket(client, client.organization, client.property)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Ticket.delete(client, objCreated.id)
            })
        })

        test('anonymous: delete Ticket', async () => {
            const client1 = await makeClientWithProperty()
            const client = await makeClient()
            const [objCreated] = await createTestTicket(client1, client1.organization, client1.property)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Ticket.delete(client, objCreated.id)
            })
        })
    })
    describe('Permissions', () => {
        test('user: create Ticket', async () => {
            const client = await makeClientWithProperty()
            const client2 = await makeClientWithProperty()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(client, client.organization, client2.property)
            })
        })

        test('user: update Ticket', async () => {
            const client = await makeClientWithProperty()
            const client2 = await makeClientWithProperty()
            const [obj] = await createTestTicket(client, client.organization, client.property)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicket(client, obj.id, { property: { connect: { id: client2.property.id } } })
            })
        })

        test('employee from "from" organization: can read tickets from "to" organizations', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                clientFrom,
                organizationTo,
                propertyTo,
                organizationFrom,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            const clientTo2 = await makeClientWithProperty()

            await createTestTicket(admin, organizationTo, propertyTo)
            await createTestTicket(admin, clientTo2.organization, clientTo2.property)

            await createTestOrganizationLink(admin, organizationFrom, clientTo2.organization)

            const tickets = await Ticket.getAll(clientFrom, { organization: { OR: [{ id: organizationTo.id }, { id: clientTo2.organization.id }] } })
            expect(tickets).toHaveLength(2)
        })

        test('employee from "to" organization: cannot read tickets from "from" organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                clientTo,
                organizationFrom,
                propertyFrom,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            await createTestTicket(admin, organizationFrom, propertyFrom)

            const tickets = await Ticket.getAll(clientTo, { organization: { id: organizationFrom.id } })
            expect(tickets).toHaveLength(0)
        })

        test('employee from "from" organization: cannot read not its own "to" organizations', async () => {
            const admin = await makeLoggedInAdminClient()
            const { organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const {
                clientFrom,
                organizationTo: organizationTo1,
            } = await createTestOrganizationWithAccessToAnotherOrganization()

            await createTestTicket(admin, organizationTo, propertyTo)

            const tickets = await Ticket.getAll(clientFrom, { organization: { OR: [{ id: organizationTo.id }, { id: organizationTo1.id }] } })
            expect(tickets).toHaveLength(0)
        })

        test('organization "from" employee with canManageTickets access: can create organization "to" tickets', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                clientFrom,
                organizationTo,
                propertyTo,
                employeeFrom,
                organizationFrom,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageTickets: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })

            const [ticket] = await createTestTicket(clientFrom, organizationTo, propertyTo)
            expect(ticket.id).toMatch(UUID_RE)
        })

        test('organization "to" employee: cannot create organization "from" tickets', async () => {
            const {
                organizationFrom,
                propertyFrom,
                clientTo,
            } = await createTestOrganizationWithAccessToAnotherOrganization()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(clientTo, organizationFrom, propertyFrom)
            })
        })

        test('user: cannot create tickets for "from" or "to" organizations', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                organizationFrom,
                propertyFrom,
                organizationTo,
                propertyTo,
                employeeFrom,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageTickets: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })

            const randomUser = await makeClientWithProperty()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(randomUser, organizationFrom, propertyFrom)
            })
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(randomUser, organizationTo, propertyTo)
            })
        })

        test('organization "from" employee: can update organization "to" tickets', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                clientFrom,
                organizationTo,
                propertyTo,
                organizationFrom,
                employeeFrom,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageTickets: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })

            const [ticket] = await createTestTicket(admin, organizationTo, propertyTo)
            const newDetails = faker.random.alphaNumeric(21)
            const [updatedTicket] = await updateTestTicket(clientFrom, ticket.id, { details: newDetails })

            expect(updatedTicket.id).toEqual(ticket.id)
            expect(updatedTicket.details).toEqual(newDetails)
        })

        test('blocked user: cannot read "to" tickets', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                employeeFrom,
                clientFrom,
                organizationTo,
                propertyTo,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            await createTestTicket(admin, organizationTo, propertyTo)
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                isBlocked: true,
            })

            const tickets = await Ticket.getAll(clientFrom)
            expect(tickets).toHaveLength(0)
        })


        test('deleted user: cannot read "to" tickets', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                employeeFrom,
                clientFrom,
                organizationFrom,
                propertyFrom,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            await createTestTicket(admin, organizationFrom, propertyFrom)
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                deletedAt: 'true',
            })

            const tickets = await Ticket.getAll(clientFrom)
            expect(tickets).toHaveLength(0)
        })

        test('blocked user: cannot create "to" tickets', async () => {
            const admin = await makeLoggedInAdminClient()
            const {
                employeeFrom,
                clientFrom,
                organizationTo,
                propertyTo,
                organizationFrom,
            } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageTickets: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })
            await createTestTicket(clientFrom, organizationTo, propertyTo)
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                isBlocked: true,
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicket(clientFrom, organizationTo, propertyTo)
            })
        })
    })
    describe('Validations', () => {
        describe('propertyAddress and propertyAddressMeta', () => {
            test('Should be filled resolved automatically on ticket creation', async () => {
                const client = await makeClientWithProperty()
                const [ticket] = await createTestTicket(client, client.organization, client.property)
                expect(ticket).toHaveProperty('propertyAddress', client.property.address)
                expect(ticket).toHaveProperty('propertyAddressMeta', client.property.addressMeta)
            })
            test('Should be changed after property changed', async () => {
                const client = await makeClientWithProperty()
                const [ticket] = await createTestTicket(client, client.organization, client.property)
                const [newProperty] = await createTestProperty(client, client.organization)
                const [updatedTicket] = await updateTestTicket(client, ticket.id, {
                    property: { connect: { id: newProperty.id } },
                })
                expect(updatedTicket).toHaveProperty('propertyAddress', newProperty.address)
                expect(updatedTicket).toHaveProperty('propertyAddressMeta', newProperty.addressMeta)
            })
            test('Should be changed after address of linked property changed', async () => {
                const client = await makeClientWithProperty()
                const client2 = await makeClientWithProperty()
                const [ticket] = await createTestTicket(client, client.organization, client.property)

                await updateTestProperty(client, client.property.id, {
                    address: client2.property.address,
                    addressMeta: client2.property.addressMeta,
                })

                // NOTE: give worker some time
                await sleep(1500)

                const changedTicket = await Ticket.getOne(client, { id: ticket.id })
                expect(changedTicket).toBeDefined()
                expect(changedTicket).toHaveProperty('propertyAddress', client2.property.address)
                expect(changedTicket).toHaveProperty('propertyAddressMeta', client2.property.addressMeta)
            })

            test('Cannot be created / changed manually', async () => {
                const client = await makeClientWithProperty()
                const [property] = await createTestProperty(client, client.organization)
                const [ticket] = await createTestTicket(client, client.organization, client.property)
                await expectToThrowUserInputError(async () => {
                    await updateTestTicket(client, ticket.id, {
                        propertyAddress: property.address,
                    })
                }, 'Field "propertyAddress" is not defined by type "TicketUpdateInput"')
                await expectToThrowUserInputError(async () => {
                    await updateTestTicket(client, ticket.id, {
                        propertyAddressMeta: property.addressMeta,
                    })
                }, 'Field "propertyAddressMeta" is not defined by type "TicketUpdateInput"')
                await expectToThrowUserInputError(async () => {
                    await createTestTicket(client, client.organization, client.property, {
                        propertyAddress: property.address,
                    })
                }, 'Field "propertyAddress" is not defined by type "TicketCreateInput"')
                await expectToThrowUserInputError(async () => {
                    await createTestTicket(client, client.organization, client.property, {
                        propertyAddressMeta: property.addressMeta,
                    })
                }, 'Field "propertyAddressMeta" is not defined by type "TicketCreateInput"')
            })
            test('Should be unchanged on Property softDeletion', async () => {
                const client = await makeClientWithProperty()
                const [ticket] = await createTestTicket(client, client.organization, client.property)
                await updateTestProperty(client, client.property.id, {
                    deletedAt: dayjs().toISOString(),
                })

                const [refetchTicket] = await Ticket.getAll(client, { id: ticket.id })
                expect(refetchTicket).toBeDefined()
                expect(refetchTicket).toHaveProperty('propertyAddress', client.property.address)
                expect(refetchTicket).toHaveProperty('propertyAddressMeta', client.property.addressMeta)
            })
        })
    })
})