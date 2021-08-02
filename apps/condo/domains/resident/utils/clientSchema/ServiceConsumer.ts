/**
 * Generated by `createschema resident.ServiceConsumer 'resident:Relationship:Resident:CASCADE; billingAccount?:Relationship:BillingAccount:SET_NULL; accountNumber:Text;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { ServiceConsumer as ServiceConsumerGQL } from '@condo/domains/resident/gql'
import { ServiceConsumer, ServiceConsumerUpdateInput, QueryAllServiceConsumersArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'resident', 'billingAccount', 'accountNumber']
const RELATIONS = ['resident', 'billingAccount']

export interface IServiceConsumerUIState extends ServiceConsumer {
    id: string
    // TODO(codegen): write IServiceConsumerUIState or extends it from
}

function convertToUIState (item: ServiceConsumer): IServiceConsumerUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IServiceConsumerUIState
}

export interface IServiceConsumerFormState {
    id?: undefined
    // TODO(codegen): write IServiceConsumerUIFormState or extends it from
}

function convertToUIFormState (state: IServiceConsumerUIState): IServiceConsumerFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IServiceConsumerFormState
}

function convertToGQLInput (state: IServiceConsumerFormState): ServiceConsumerUpdateInput {
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
} = generateReactHooks<ServiceConsumer, ServiceConsumerUpdateInput, IServiceConsumerFormState, IServiceConsumerUIState, QueryAllServiceConsumersArgs>(ServiceConsumerGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
