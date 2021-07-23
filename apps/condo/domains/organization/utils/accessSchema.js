const { OrganizationLink } = require('./serverSchema')
const { getByCondition } = require('@core/keystone/schema')

async function checkOrganizationPermission (userId, organizationId, permission) {
    if (!userId || !organizationId) return false

    const employee = await getByCondition('OrganizationEmployee', {
        organization: { id: organizationId },
        user: { id: userId },
        deletedAt: null,
    })

    if (!employee || !employee.role) {
        return false
    }

    if (employee.isBlocked) {
        return false
    }

    if (employee.deletedAt !== null) {
        return false
    }

    const employeeRole = await getByCondition('OrganizationEmployeeRole', {
        id: employee.role,
        organization: { id: organizationId },
    })
    if (!employeeRole) return false
    return employeeRole[permission] || false
}

async function checkRelatedOrganizationPermission (context, userId, organizationId, permission) {
    if (!context || !userId || !organizationId) return false

    const [organizationLink] = await OrganizationLink.getAll(context,
        { from: checkIfUserIsOrganizationEmployee(userId), to: { id: organizationId } })
    if (!organizationLink) return false

    return checkOrganizationPermission(userId, organizationLink.from.id, permission)
}


async function checkUserBelongsToOrganization (userId, organizationId) {
    if (!userId || !organizationId) return false
    const employee = await getByCondition('OrganizationEmployee', {
        organization: { id: organizationId },
        user: { id: userId },
        isAccepted: true,
        isBlocked: false,
        isRejected: false,
    })

    if (!employee) {
        return false
    }

    if (employee.isBlocked) {
        return false
    }

    return employee.deletedAt === null
}

const checkIfUserIsOrganizationEmployee = userId => ({ employees_some: { user: { id: userId }, isBlocked: false, deletedAt: null } })
const checkUserIsRelatedFromOrganizationEmployee = userId => ({ relatedOrganizations_some: { from: checkIfUserIsOrganizationEmployee(userId) } })

module.exports = {
    checkOrganizationPermission,
    checkUserBelongsToOrganization,
    checkRelatedOrganizationPermission,
    checkUserIsRelatedFromOrganizationEmployee,
    checkIfUserIsOrganizationEmployee,
}
