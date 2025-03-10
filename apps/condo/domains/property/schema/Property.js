/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */

const get = require('lodash/get')
const isEmpty = require('lodash/isEmpty')
const Ajv = require('ajv')
const dayjs = require('dayjs')
const { Text, Select, Virtual, Integer, CalendarDay, Decimal } = require('@keystonejs/fields')

const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const { compareStrI } = require('@condo/domains/common/utils/string.utils')
const { SENDER_FIELD, DV_FIELD, ADDRESS_META_FIELD } = require('@condo/domains/common/schema/fields')
const { hasDbFields, hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const {
    DV_UNKNOWN_VERSION_ERROR,
    JSON_UNKNOWN_VERSION_ERROR,
    JSON_SCHEMA_VALIDATION_ERROR,
    JSON_EXPECT_OBJECT_ERROR,
    UNIQUE_ALREADY_EXISTS_ERROR,
} = require('@condo/domains/common/constants/errors')

const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const access = require('@condo/domains/property/access/Property')
const MapSchemaJSON = require('@condo/domains/property/components/panels/Builder/MapJsonSchema.json')

const { manageResidentToPropertyAndOrganizationConnections } = require('@condo/domains/resident/tasks')
const { manageTicketPropertyAddressChange } = require('@condo/domains/ticket/tasks')


const { PROPERTY_MAP_GRAPHQL_TYPES, GET_TICKET_INWORK_COUNT_BY_PROPERTY_ID_QUERY, GET_TICKET_CLOSED_COUNT_BY_PROPERTY_ID_QUERY } = require('../gql')
const { Property: PropertyAPI } = require('../utils/serverSchema')
const { normalizePropertyMap } = require('../utils/serverSchema/helpers')
const { PROPERTY_MAP_JSON_FIELDS } = require('@condo/domains/property/gql')

const ajv = new Ajv()
const jsonMapValidator = ajv.compile(MapSchemaJSON)
const REQUIRED_FIELDS = ['organization', 'type', 'address', 'addressMeta']

// ORGANIZATION_OWNED_FIELD
const Property = new GQLListSchema('Property', {
    schemaDoc: 'Common property. The property is divided into separate `unit` parts, each of which can be owned by an independent owner. Community farm, residential buildings, or a cottage settlement',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        organization: ORGANIZATION_OWNED_FIELD,

        name: {
            schemaDoc: 'Client understandable Property name. A well-known property name for the client',
            type: Text,
            isRequired: false,
        },

        address: {
            schemaDoc: 'Normalized address',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: async ({ resolvedData, fieldPath, addFieldValidationError, context, existingItem, operation }) => {
                    const value = resolvedData[fieldPath]
                    const isCreate = operation === 'create'
                    const isUpdateAddress = operation === 'update' && resolvedData.address !== existingItem.address

                    if (isCreate || isUpdateAddress) {
                        const organizationId = isCreate ? resolvedData.organization : existingItem.organization
                        const addressSearch = isCreate ? { address_i: value } : { address: value }
                        const where = {
                            ...addressSearch,
                            organization: {
                                id: organizationId,
                            },
                            deletedAt: null,
                        }
                        const sameAddressProperties = await PropertyAPI.getAll(context, where, { first: 1 })

                        if (!isEmpty(sameAddressProperties)) {
                            addFieldValidationError(`${UNIQUE_ALREADY_EXISTS_ERROR}${fieldPath}] Property with same address exist in current organization`)
                        }
                    }
                },
            },
        },

        addressMeta: ADDRESS_META_FIELD,

        type: {
            schemaDoc: 'Common property type',
            type: Select,
            options: 'building,village',
            isRequired: true,
        },

        map: {
            schemaDoc: 'Property map/schema',
            type: Json,
            extendGraphQLTypes: [PROPERTY_MAP_GRAPHQL_TYPES],
            graphQLReturnType: 'BuildingMap',
            graphQLAdminFragment: `{ ${PROPERTY_MAP_JSON_FIELDS} }`,
            isRequired: false,
            hooks: {
                resolveInput: ({ resolvedData }) => {
                    const { map } = resolvedData
                    if (map) {
                        return normalizePropertyMap(map)
                    }
                },
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    if (!resolvedData.hasOwnProperty(fieldPath)) return // skip if on value
                    const value = resolvedData[fieldPath]
                    if (value === null) return // null is OK
                    if (typeof value !== 'object') { return addFieldValidationError(`${JSON_EXPECT_OBJECT_ERROR}${fieldPath}] ${fieldPath} field type error. We expect JSON Object`) }
                    const { dv } = value
                    if (dv === 1) {
                        if (!jsonMapValidator(value)){
                            // console.log(JSON.stringify(jsonMapValidator.errors, null, 2))
                            return addFieldValidationError(`${JSON_SCHEMA_VALIDATION_ERROR}] invalid json structure of "map" field`)
                        }
                    } else {
                        return addFieldValidationError(`${JSON_UNKNOWN_VERSION_ERROR}${fieldPath}] Unknown \`dv\` attr inside JSON Object`)
                    }
                },
            },
        },
        unitsCount: {
            schemaDoc: 'A number of parts in the property. The number of flats for property.type = house. The number of garden houses for property.type = village.',
            type: Integer,
            isRequired: true,
            defaultValue: 0,
            hooks: {
                resolveInput: async ({ operation, existingItem, resolvedData }) => {
                    const getTotalUnitsCount = (map) => {
                        return get(map, 'sections', [])
                            .map((section) => get(section, 'floors', [])
                                .map(floor => get(floor, 'units', [])))
                            .flat(2).filter(unit => {
                                const unitType = get(unit, 'unitType', 'flat')
                                // unitType may be null with old property data, so all these units used to be 'flat' type by default
                                return !isEmpty(unitType) ? unitType === 'flat' : isEmpty(unitType)
                            }).length
                    }

                    let unitsCount = 0

                    if (operation === 'create') {
                        const map = get(resolvedData, 'map')

                        if (map) {
                            unitsCount = getTotalUnitsCount(map)
                        }
                    }

                    if (operation === 'update') {
                        const existingMap = get(existingItem, 'map')
                        const updatedMap = get(resolvedData, 'map')

                        const isMapDeleted = existingMap && !updatedMap

                        if (isMapDeleted) {
                            unitsCount = 0
                        } else if (updatedMap) {
                            unitsCount = getTotalUnitsCount(updatedMap)
                        }
                    }

                    return unitsCount
                },
            },
        },
        uninhabitedUnitsCount: {
            schemaDoc: 'A number of non-residential units. Number of parking places for unit.unitType = parking, apartment, commercial & warehouse',
            type: Integer,
            isRequired: true,
            defaultValue: 0,
            hooks: {
                resolveInput: async ({ operation, existingItem, resolvedData }) => {
                    let uninhabitedUnitsCount = 0
                    const getUninhabitedUnitsCount = (map) => {
                        const parkingSection = get(map, 'parking', [])
                        const parkingUnitsCount = !isEmpty(parkingSection) ? parkingSection
                            .map((section) => get(section, 'floors', [])
                                .map(floor => get(floor, 'units', []).length)
                            )
                            .flat()
                            .reduce((total, unitsOnFloor) => total + unitsOnFloor, 0) : 0

                        const sectionUnitsCount = get(map, 'sections', [])
                            .map((section) => get(section, 'floors', [])
                                .map(floor => get(floor, 'units', [])))
                            .flat(2).filter(unit => {
                                const unitType = get(unit, 'unitType', 'flat')
                                return !isEmpty(unitType) ? unitType !== 'flat' : !isEmpty(unitType)
                            }).length

                        return parkingUnitsCount + sectionUnitsCount
                    }

                    if (operation === 'create') {
                        const map = get(resolvedData, 'map')

                        if (map) {
                            uninhabitedUnitsCount = getUninhabitedUnitsCount(map)
                        }
                    }

                    if (operation === 'update') {
                        const existingMap = get(existingItem, 'map')
                        const updatedMap = get(resolvedData, 'map')

                        const isMapDeleted = existingMap && !updatedMap

                        if (isMapDeleted) {
                            uninhabitedUnitsCount = 0
                        } else if (updatedMap) {
                            uninhabitedUnitsCount = getUninhabitedUnitsCount(updatedMap)
                        }
                    }

                    return uninhabitedUnitsCount
                },
            },
        },
        ticketsClosed: {
            schemaDoc: 'Counter for closed tickets',
            type: Virtual,
            resolver: async (item, _, context) => {
                const { data, errors } = await context.executeGraphQL({
                    query: GET_TICKET_CLOSED_COUNT_BY_PROPERTY_ID_QUERY,
                    variables: {
                        propertyId: item.id,
                    },
                })
                if (errors) {
                    console.error('Error while fetching virtual field ticketsClosed', errors)
                    return 0
                }
                return data.closed.count
            },
        },

        ticketsInWork: {
            schemaDoc: 'Counter for not closed tickets',
            type: Virtual,
            resolver: async (item, _, context) => {
                const { data, errors } = await context.executeGraphQL({
                    query: GET_TICKET_INWORK_COUNT_BY_PROPERTY_ID_QUERY,
                    variables: {
                        propertyId: item.id,
                    },
                })
                if (errors) {
                    console.error('Error while fetching virtual field ticketsInWork', errors)
                    return 0
                }
                return data.inwork.count
            },
        },

        yearOfConstruction: {
            schemaDoc: 'Year of the property was built',
            type: CalendarDay,
            format: 'YYYY',
            yearRangeTo: dayjs().year(),
        },

        area: {
            schemaDoc: 'Property area in square meters',
            type: Decimal,
            knexOptions: {
                scale: 2,
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        auth: true,
        delete: false,
        read: access.canReadProperties,
        create: access.canManageProperties,
        update: access.canManageProperties,
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['organization', 'address'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'property_unique_organization_and_address',
            },
        ],
    },
    hooks: {
        validateInput: ({ resolvedData, existingItem, context, addValidationError }) => {
            if (!hasDvAndSenderFields(resolvedData, context, addValidationError)) return
            if (!hasDbFields(REQUIRED_FIELDS, resolvedData, existingItem, context, addValidationError)) return

            const { dv } = resolvedData

            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown 'dv'`)
            }
        },
        afterChange: async ({ operation, existingItem, updatedItem }) => {
            const isSoftDeleteOperation = operation === 'update' && !existingItem.deletedAt && Boolean(updatedItem.deletedAt)
            const isCreatedProperty = operation === 'create' && Boolean(updatedItem.address)
            const isRestoredProperty = operation === 'update' && Boolean(existingItem.deletedAt) && !updatedItem.deletedAt
            // TODO(DOMA-1779): detect property.address locale
            const isAddressUpdated = operation === 'update' && !compareStrI(existingItem.address, updatedItem.address)
            const affectedAddress = isSoftDeleteOperation || isAddressUpdated ? existingItem.address : updatedItem.address

            // We handle resident reconnections only for these operation types
            if (isCreatedProperty || isRestoredProperty || isSoftDeleteOperation || isAddressUpdated) {
                if (isAddressUpdated) {
                    // Change linked tickets "propertyAddress"
                    const userInfo = { dv: updatedItem.dv, sender: updatedItem.sender }
                    await manageTicketPropertyAddressChange.delay(updatedItem.id, userInfo)
                    // Reconnect residents (if any) to oldest non-deleted property with address = updatedItem.address
                    await manageResidentToPropertyAndOrganizationConnections.delay(updatedItem.address)
                }

                // Reconnect residents (if any) to oldest non-deleted property with address = affectedAddress
                await manageResidentToPropertyAndOrganizationConnections.delay(affectedAddress)
            }
        },
    },
})

module.exports = {
    Property,
}
