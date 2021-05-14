/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */
const { getByCondition } = require('@core/keystone/schema')

async function canReadOrganizationEmployeeRoles ({ authentication: { item: user } }) {
    if (!user) return false
    if (user.isAdmin) return {}
    return {
        // user is inside employee list
        organization: { employees_some: { user: { id: user.id } } },
    }
}

async function canManageOrganizationEmployeeRoles ({ authentication: { item: user }, operation, originalInput }) {
    if (!user) return false
    if (user.isAdmin) return true
    if (operation === 'create') {
        // `GraphQLWhere` type cannot be used in case of `create` operation,
        // because we will get an error:
        // > Expected a Boolean for OrganizationEmployeeRole.access.create(), but got Object
        // In https://www.keystonejs.com/api/access-control#list-level-access-control it states:
        // > For `create` operations, an `AccessDeniedError` is returned if the operation is set to / returns `false`
        // Actually, here we repeating the same logic, as declared for another operations
        const employeeForUser = await getByCondition('OrganizationEmployee', {
            organization: { id: originalInput.organization.connect.id },
            user: { id: user.id },
        })
        const employeeRole = await getByCondition('OrganizationEmployeeRole', {
            id: employeeForUser.role,
        })
        if (!employeeRole) return false
        return employeeRole.canManageRoles
    }
    return {
        // user is inside employee list
        organization: { employees_some: { user: { id: user.id }, role: { canManageRoles: true } } },
    }
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOrganizationEmployeeRoles,
    canManageOrganizationEmployeeRoles,
}
