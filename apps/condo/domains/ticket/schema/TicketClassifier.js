/**
 * Generated by `createschema ticket.TicketClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;parent?:Relationship:TicketClassifier:PROTECT;'`
 */

const { Text, Relationship, Virtual } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const { COMMON_AND_ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/ticket/access/TicketClassifier')

const TicketClassifier = new GQLListSchema('TicketClassifier', {
    schemaDoc: '[DEPRECATED] Ticket typification/classification. Will be removed after migration',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,
        organization: COMMON_AND_ORGANIZATION_OWNED_FIELD,
        // TODO(zuch): `${item.parent.parent.name} - ${item.parent.name} - ${item.name}`
        fullName: {
            schemaDoc: 'Multi level name',
            type: Virtual,
            resolver: (item) => `${item.parent} -- ${item.name}`,
        },
        name: {
            schemaDoc: 'This level name',
            type: Text,
            isRequired: true,
        },
        parent: {
            schemaDoc: 'Multi level classification support',
            type: Relationship,
            ref: 'TicketClassifier',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadTicketClassifiers,
        create: access.canManageTicketClassifiers,
        update: access.canManageTicketClassifiers,
        delete: false,
        auth: false,
    },
})

module.exports = {
    TicketClassifier,
}
