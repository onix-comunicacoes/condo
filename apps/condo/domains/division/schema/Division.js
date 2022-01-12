/**
 * Generated by `createschema division.Division 'name:Text; organization:Relationship:Organization:CASCADE; responsible:Relationship:OrganizationEmployee:PROTECT;'`
 */

const { Text, Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/division/access/Division')
const { OrganizationEmployee, Organization } = require('@condo/domains/organization/utils/serverSchema')
const { get } = require('lodash')
const { Property } = require('@condo/domains/property/utils/serverSchema')

const Division = new GQLListSchema('Division', {
    schemaDoc: 'Grouping of properties and employees with one single responsible person',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        name: {
            schemaDoc: 'Display name of this division',
            type: Text,
            isRequired: true,
        },

        organization: ORGANIZATION_OWNED_FIELD,

        responsible: {
            schemaDoc: 'Person, responsible for this division',
            type: Relationship,
            ref: 'OrganizationEmployee',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
            hooks: {
                validateInput: async ({ resolvedData, operation, existingItem, addFieldValidationError, context, fieldPath }) => {
                    const responsibleId = resolvedData[fieldPath]
                    const [responsible] = await OrganizationEmployee.getAll(context, { id: responsibleId })
                    if (!responsible.role.canBeAssignedAsResponsible) {
                        addFieldValidationError(
                            'Cannot be connected to responsible which does not have `canBeAssignedAsResponsible` ability',
                        )
                    }
                    let organizationId
                    if (operation === 'create') {
                        organizationId = resolvedData.organization
                    }
                    if (operation === 'update') {
                        organizationId = get(existingItem, 'organization')
                    }
                    if (organizationId !== responsible.organization.id) {
                        addFieldValidationError('Cannot be connected to responsible from another organization')
                    }
                },
            },
        },

        properties: {
            schemaDoc: 'Properties in service by this division',
            type: Relationship,
            ref: 'Property',
            many: true,
            hooks: {
                validateInput: async ({ resolvedData, operation, existingItem, addFieldValidationError, context, fieldPath }) => {
                    let organizationId
                    if (operation === 'create') {
                        organizationId = resolvedData.organization
                    }
                    if (operation === 'update') {
                        organizationId = get(existingItem, 'organization')
                    }
                    const [organization] = await Organization.getAll(context, { id: organizationId })

                    const propertyIds = resolvedData[fieldPath]
                    // Fetch in specified order to be able to test a list of ids in error message
                    const properties = await Property.getAll(context, { id_in: propertyIds }, { sortBy: ['createdAt_ASC'] })
                    const propertyIdsFromAnotherOrganization = []
                    properties.map((property) => {
                        if (property.organization.id !== organization.id) {
                            propertyIdsFromAnotherOrganization.push(property.id)
                        }
                    })
                    if (propertyIdsFromAnotherOrganization.length > 0) {
                        addFieldValidationError(
                            `Cannot be connected to following property(s), because they are belonging to another organization(s): ${propertyIdsFromAnotherOrganization.join()}, `,
                        )
                    }
                },
            },
        },

        executors: {
            schemaDoc: 'Employees, that will be assigned as executors to all corresponding tickets',
            type: Relationship,
            ref: 'OrganizationEmployee',
            many: true,
            hooks: {
                validateInput: async ({ resolvedData, operation, existingItem, addFieldValidationError, context, fieldPath }) => {
                    let organizationId
                    if (operation === 'create') {
                        organizationId = resolvedData.organization
                    }
                    if (operation === 'update') {
                        organizationId = get(existingItem, 'organization')
                    }
                    const [organization] = await Organization.getAll(context, { id: organizationId })

                    const employeeIds = resolvedData[fieldPath]
                    // Fetch in specified order to be able to test a list of ids in error message
                    const employees = await OrganizationEmployee.getAll(
                        context,
                        { id_in: employeeIds },
                        { sortBy: ['createdAt_ASC'] },
                    )
                    const employeeIdsFromAnotherOrganization = []
                    const employeeIdsThatCannotBeAssignableAsExecutor = []
                    employees.map((employee) => {
                        if (!employee.role.canBeAssignedAsExecutor) {
                            employeeIdsThatCannotBeAssignableAsExecutor.push(employee.id)
                        }
                        if (employee.organization.id !== organization.id) {
                            employeeIdsFromAnotherOrganization.push(employee.id)
                        }
                    })
                    if (employeeIdsFromAnotherOrganization.length > 0) {
                        addFieldValidationError(
                            `Cannot be connected to following employee(s) as executors, because they are belonging to another organization(s): ${employeeIdsFromAnotherOrganization.join()}, `,
                        )
                    }
                    if (employeeIdsThatCannotBeAssignableAsExecutor.length > 0) {
                        addFieldValidationError(
                            `Cannot be connected to following employee(s) as executors, because they does not have 'canBeAssignedAsExecutor' role ability: ${employeeIdsThatCannotBeAssignableAsExecutor.join()}, `,
                        )
                    }
                },
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadDivisions,
        create: access.canManageDivisions,
        update: access.canManageDivisions,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Division,
}
