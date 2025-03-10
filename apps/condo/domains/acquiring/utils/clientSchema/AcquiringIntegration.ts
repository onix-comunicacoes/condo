/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { AcquiringIntegration as AcquiringIntegrationGQL } from '@condo/domains/acquiring/gql'
import { AcquiringIntegration, AcquiringIntegrationUpdateInput, QueryAllAcquiringIntegrationsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'shortDescription', 'detailsTitle', 'detailsText', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'name', 'canGroupReceipts', 'hostUrl']
const RELATIONS = ['supportedBillingIntegrations']

export interface IAcquiringIntegrationUIState extends AcquiringIntegration {
    id: string
}

function convertToUIState (item: AcquiringIntegration): IAcquiringIntegrationUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IAcquiringIntegrationUIState
}

export interface IAcquiringIntegrationFormState {
    id?: undefined
}

function convertToUIFormState (state: IAcquiringIntegrationUIState): IAcquiringIntegrationFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IAcquiringIntegrationFormState
}

function convertToGQLInput (state: IAcquiringIntegrationFormState): AcquiringIntegrationUpdateInput {
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
} = generateReactHooks<AcquiringIntegration, AcquiringIntegrationUpdateInput, IAcquiringIntegrationFormState, IAcquiringIntegrationUIState, QueryAllAcquiringIntegrationsArgs>(AcquiringIntegrationGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
