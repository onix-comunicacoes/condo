/**
 * Generated by `createschema ticket.TicketContact 'property:Relationship:Property:PROTECT; unitName:Text; email:Text; phone:Text; name:Text;' --force`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { TicketContact as TicketContactGQL } from '@condo/domains/ticket/gql'
import { TicketContact, TicketContactUpdateInput, QueryAllTicketContactsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'property', 'unitName', 'email', 'phone', 'name']
const RELATIONS = ['property']

export interface ITicketContactUIState extends TicketContact {
    id: string
    // TODO(codegen): write ITicketContactUIState or extends it from
}

function convertToUIState (item: TicketContact): ITicketContactUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketContactUIState
}

export interface ITicketContactFormState {
    id?: undefined
    // TODO(codegen): write ITicketContactUIFormState or extends it from
}

function convertToUIFormState (state: ITicketContactUIState): ITicketContactFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as ITicketContactFormState
}

function convertToGQLInput (state: ITicketContactFormState): TicketContactUpdateInput {
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
} = generateReactHooks<TicketContact, TicketContactUpdateInput, ITicketContactFormState, ITicketContactUIState, QueryAllTicketContactsArgs>(TicketContactGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
