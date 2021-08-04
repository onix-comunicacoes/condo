/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { OrganizationEmployeeRole as OrganizationEmployeeRoleGQL } from '@condo/domains/organization/gql'
import { OrganizationEmployeeRole, OrganizationEmployeeRoleUpdateInput, QueryAllOrganizationEmployeeRolesArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'name', 'description', 'statusTransitions', 'canManageOrganization', 'canManageEmployees', 'canManageRoles', 'canManageIntegrations', 'canManageProperties', 'canManageTickets', 'canManageTicketComments']
const RELATIONS = ['organization']

export interface IOrganizationEmployeeRoleUIState extends OrganizationEmployeeRole {
    id: string
    // TODO(codegen): write IOrganizationEmployeeRoleUIState or extends it from
}

function convertToUIState (item: OrganizationEmployeeRole): IOrganizationEmployeeRoleUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IOrganizationEmployeeRoleUIState
}

export interface IOrganizationEmployeeRoleFormState {
    id?: undefined
    // TODO(codegen): write IOrganizationEmployeeRoleUIFormState or extends it from
}

function convertToUIFormState (state: IOrganizationEmployeeRoleUIState): IOrganizationEmployeeRoleFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IOrganizationEmployeeRoleFormState
}

function convertToGQLInput (state: IOrganizationEmployeeRoleFormState): OrganizationEmployeeRoleUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

export interface IOrganizationEmployeeRoleSelectState {
    value: string
    label: string
}

const convertGQLItemToFormSelectState = (item: OrganizationEmployeeRole): IOrganizationEmployeeRoleSelectState | undefined => {
    if (!item) {
        return
    }
    const { name, id } = item

    return { value: id, label: name }
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<OrganizationEmployeeRole, OrganizationEmployeeRoleUpdateInput, IOrganizationEmployeeRoleFormState, IOrganizationEmployeeRoleUIState, QueryAllOrganizationEmployeeRolesArgs>(OrganizationEmployeeRoleGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
    convertGQLItemToFormSelectState,
}
