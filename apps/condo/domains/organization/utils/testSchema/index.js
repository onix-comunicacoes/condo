/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const { makeClientWithNewRegisteredAndLoggedInUser } = require ('../../../user/utils/testSchema');
const { makeLoggedInAdminClient } = require ('@core/keystone/test.utils');
const { getRandomString } = require('@core/keystone/test.utils')

const { generateGQLTestUtils } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')
const { Organization: OrganizationGQL, OrganizationEmployee: OrganizationEmployeeGQL, OrganizationEmployeeRole: OrganizationEmployeeRoleGQL } = require('@condo/domains/organization/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const OrganizationEmployeeRole = generateGQLTestUtils(OrganizationEmployeeRoleGQL)
const Organization = generateGQLTestUtils(OrganizationGQL)
const OrganizationEmployee = generateGQLTestUtils(OrganizationEmployeeGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestOrganization (client, extraAttrs = {}) {
    if (!client) throw new Error ('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric (8) }
    const country = 'ru'
    const name = faker.company.companyName ()
    const description = faker.company.catchPhrase ()
    const meta = {
        dv: 1, inn: '6670428515', kpp: '667001001', city: faker.address.city (), zipCode: faker.address.zipCode (),
        street: faker.address.streetName (), number: faker.address.secondaryAddress (),
        county: faker.address.county (),
    }

    const attrs = {
        dv: 1,
        sender,
        country, name, description, meta,
        ...extraAttrs,
    }
    const obj = await Organization.create(client, attrs)
    return [obj, attrs]
}

async function updateTestOrganization (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestOrganization logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Organization.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestOrganizationEmployee (client, organization, user, role, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!user || !user.id) throw new Error('no user.id')
    if (!role || !role.id) throw new Error('no role.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestOrganizationEmployee logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        email: faker.internet.email(),
        organization: { connect: { id: organization.id } },
        user: { connect: { id: user.id } },
        role: { connect: { id: role.id } },
        ...extraAttrs,
    }
    const obj = await OrganizationEmployee.create(client, attrs)
    return [obj, attrs]
}

async function updateTestOrganizationEmployee (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestOrganizationEmployee logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await OrganizationEmployee.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestOrganizationEmployeeRole (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.random.alphaNumeric(8),
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await OrganizationEmployeeRole.create(client, attrs)
    return [obj, attrs]
}

/**
 * Simplifies creating series of instances
 */
async function createTestOrganizationEmployeeFullChain () {
    const admin = await makeLoggedInAdminClient()
    const [organization] = await createTestOrganization(admin)
    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
    const [obj, attrs] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)
    return [obj, attrs, {role, organization, admin}]
}

async function updateTestOrganizationEmployeeRole (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.random.alphaNumeric(8),
        ...extraAttrs,
    }
    const obj = await OrganizationEmployeeRole.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Organization,
    OrganizationEmployee,
    OrganizationEmployeeRole,
    createTestOrganizationEmployeeRole,
    updateTestOrganizationEmployeeRole,
    createTestOrganization,
    updateTestOrganization,
    createTestOrganizationEmployee,
    createTestOrganizationEmployeeFullChain,
    updateTestOrganizationEmployee,
}
/* AUTOGENERATE MARKER <EXPORTS> */
