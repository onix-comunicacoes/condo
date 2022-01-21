/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const gql = require('graphql-tag')

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const MESSAGE_FIELDS = `{ organization { id } user { id email phone } email phone lang type meta status processingMeta deliveredAt ${COMMON_FIELDS} }`
const Message = generateGqlQueries('Message', MESSAGE_FIELDS)

const SEND_MESSAGE = gql`
    mutation sendMessage ($data: SendMessageInput!) {
        result: sendMessage(data: $data) { status id }
    }
`

const RESEND_MESSAGE = gql`
    mutation resendMessage ($data: ResendMessageInput!) {
        result: resendMessage(data: $data) { status id }
    }
`

const PUSH_TOKEN_REQUIRED_FIELDS = 'deviceId token serviceType meta owner { id }'
const PUSH_TOKEN_FIELDS = `{id ${PUSH_TOKEN_REQUIRED_FIELDS}}`
const PUSH_TOKEN_FIELDS_WITH_COMMON = `{${PUSH_TOKEN_REQUIRED_FIELDS} ${COMMON_FIELDS}}`

const PushToken = generateGqlQueries('PushToken', PUSH_TOKEN_FIELDS_WITH_COMMON)

const REGISTER_PUSH_TOKEN_MUTATION = gql`
    mutation registerPushTokenService ($data: RegisterPushTokenInput!) {
        result: registerPushToken(data: $data) ${PUSH_TOKEN_FIELDS}
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Message,
    SEND_MESSAGE,
    RESEND_MESSAGE,
    PushToken,
    REGISTER_PUSH_TOKEN_MUTATION,

/* AUTOGENERATE MARKER <EXPORTS> */
}
