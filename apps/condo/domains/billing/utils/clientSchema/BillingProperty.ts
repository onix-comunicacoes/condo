/**
 * Generated by `createschema billing.BillingProperty 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; bindingId:Text; address:Text; raw:Json; meta:Json'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { BillingProperty as BillingPropertyGQL } from '@condo/domains/billing/gql'
import { BillingProperty, BillingPropertyUpdateInput, QueryAllBillingPropertiesArgs } from '@app/condo/schema'

const FIELDS = [
    'id',
    'deletedAt',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
    'context',
    'importId',
    'address',
    'raw',
    'meta',
]
const RELATIONS = ['context']

export interface IBillingPropertyUIState extends BillingProperty {
    id: string
    // TODO(codegen): write IBillingPropertyUIState or extends it from
}

function convertToUIState(item: BillingProperty): IBillingPropertyUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IBillingPropertyUIState
}

export interface IBillingPropertyFormState {
    id?: undefined
    // TODO(codegen): write IBillingPropertyUIFormState or extends it from
}

function convertToUIFormState(state: IBillingPropertyUIState): IBillingPropertyFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? attrId || state[attr] : state[attr]
    }
    return result as IBillingPropertyFormState
}

function convertToGQLInput(state: IBillingPropertyFormState): BillingPropertyUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? { connect: { id: attrId || state[attr] } } : state[attr]
    }
    return result
}

const { useObject, useObjects, useCreate, useUpdate, useDelete } = generateReactHooks<
    BillingProperty,
    BillingPropertyUpdateInput,
    IBillingPropertyFormState,
    IBillingPropertyUIState,
    QueryAllBillingPropertiesArgs
>(BillingPropertyGQL, { convertToGQLInput, convertToUIState })

export { useObject, useObjects, useCreate, useUpdate, useDelete, convertToUIFormState }
