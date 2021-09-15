/**
 * Generated by `createservice billing.CheckOrganizationIntegrationContextExistService --type queries`
 */

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/billing/access/CheckOrganizationIntegrationContextExistService')


const CheckOrganizationIntegrationContextExistService = new GQLCustomSchema('CheckOrganizationIntegrationContextExistService', {
    types: [
        {
            access: true,
            // TODO(codegen): write CheckOrganizationIntegrationContextExistService input !
            type: 'input CheckOrganizationIntegrationContextExistInput { dv: Int!, sender: JSON! }',
        },
        {
            access: true,
            // TODO(codegen): write CheckOrganizationIntegrationContextExistService output !
            type: 'type CheckOrganizationIntegrationContextExistOutput { id: String! }',
        },
    ],
    
    queries: [
        {
            access: access.canCheckOrganizationIntegrationContextExist,
            schema: 'executeCheckOrganizationIntegrationContextExist (data: CheckOrganizationIntegrationContextExistInput!): CheckOrganizationIntegrationContextExistOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data } = args
                // TODO(codegen): write logic here
            },
        },
    ],
    
})

module.exports = {
    CheckOrganizationIntegrationContextExistService,
}
