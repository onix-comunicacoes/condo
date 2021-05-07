/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Organization as OrganizationGQL } from '@condo/domains/organization/gql'
import { Organization, OrganizationUpdateInput, QueryAllOrganizationsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'country', 'name', 'description', 'avatar', 'meta', 'employees', 'statusTransitions', 'defaultEmployeeRoleStatusTransitions']
const RELATIONS = []

export interface IOrganizationUIState extends Organization {
    id: string
    // TODO(codegen): write IOrganizationUIState or extends it from
}

function convertToUIState (item: Organization): IOrganizationUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IOrganizationUIState
}

export interface IOrganizationFormState {
    id?: undefined
    // TODO(codegen): write IOrganizationUIFormState or extends it from
}

function convertToUIFormState (state: IOrganizationUIState): IOrganizationFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IOrganizationFormState
}

function convertToGQLInput (state: IOrganizationFormState): OrganizationUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<Organization, OrganizationUpdateInput, IOrganizationFormState, IOrganizationUIState, QueryAllOrganizationsArgs>(OrganizationGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
