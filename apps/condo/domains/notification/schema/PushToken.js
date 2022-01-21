/**
 * Generated by `createschema notification.PushToken PushToken`
 */

const { Text, Relationship, Select } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')

const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/notification/access/PushToken')

const { DEVICE_SERVICE_TYPES_KEYS } = require('../constants')

const PushToken = new GQLListSchema('PushToken', {
    schemaDoc: 'Used to send push notifications via corresponding transport, depending on serviceType. Push token is received from mobile or web device. ',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        owner: {
            schemaDoc: 'Owner user of a device and a push token. User, which is logged in on the device. Push token can be created by anonymous user and connected to authorized user later on.',
            type: Relationship,
            ref: 'User',
            isRequired: false,
            kmigratorOptions: { null: true, on_delete: 'models.CASCADE' },
            knexOptions: { isNotNullable: false }, // token can be crated by anonymous and User could be connected later.
        },

        deviceId: {
            schemaDoc: 'Mobile/web device ID, which is used to identify device. One user can have many devices, and one device can be used by many users, one at a time.',
            type: Text,
            isRequired: true,
            kmigratorOptions: { unique: true, null: false },
        },

        token: {
            schemaDoc: 'Used by transport services (FireBase, Apple, Huawei, etc.) to transfer push notifications to devices.',
            type: Text,
            isRequired: true,
            kmigratorOptions: { unique: true, null: false },
        },

        serviceType: {
            schemaDoc: 'Transport service, that delivers push notifications to client device. Type of device requires specific transport service, e.g. Huawei devices can not receive notifications through FireBase.',
            type: Select,
            options: DEVICE_SERVICE_TYPES_KEYS,
            isRequired: true,
            kmigratorOptions: { null: false },
        },

        meta: {
            schemaDoc: 'Device metadata. OS type, OS version, etc.',
            type: Json,
            isRequired: false,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadPushTokens,
        create: access.canManagePushTokens,
        update: access.canManagePushTokens,
        delete: false,
        auth: false,
    },
})

module.exports = {
    PushToken,
}
