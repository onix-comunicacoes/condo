/**
 * Generated by `createservice property.RegisterResidentService --type mutations`
 */

const { getById, GQLCustomSchema } = require('@core/keystone/schema')
const access = require('../access/RegisterResidentService')
const { Resident } = require('../utils/serverSchema/index')
const { Property } = require('@condo/domains/property/utils/serverSchema')
const { Resident: ResidentAPI } = require('../utils/serverSchema')

/**
 * Removes flat type and number from address string, if flatType provided and address contains it.
 * @param address
 * @param flatType
 * @returns {*}
 */
const removeFlatNum = (address, flatType) => flatType ? address.split(`, ${flatType}`)[0] : address

const RegisterResidentService = new GQLCustomSchema('RegisterResidentService', {
    types: [
        {
            access: true,
            type: 'input RegisterResidentInput { dv: Int!, sender: SenderFieldInput!, address: String!, addressMeta: AddressMetaFieldInput!, unitName: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canRegisterResident,
            schema: 'registerResident(data: RegisterResidentInput!): Resident',
            resolver: async (parent, args, context) => {
                const { data: { dv, sender, address, addressMeta, unitName } } = args
                const attrs = {
                    dv,
                    sender,
                    address,
                    addressMeta,
                    unitName,
                    user: { connect: { id: context.authedItem.id } },
                }
                const [existingResident] = await ResidentAPI.getAll(context, {
                    address,
                    unitName,
                    user: { id: context.authedItem.id },
                })
                const propertyAddress = removeFlatNum(address, addressMeta.data.flat_type)
                const [property] = await Property.getAll(context, { address: propertyAddress, deletedAt: null }, { sortBy: ['createdAt_ASC'] })

                if (property) {
                    attrs.property = { connect: { id: property.id } }
                    attrs.organization = { connect: { id: property.organization.id } }
                }

                let id
                if (existingResident) {
                    await ResidentAPI.update(context, existingResident.id, {
                        ...attrs,
                        deletedAt: null,
                        address: undefined, // skip value from attrs
                        addressMeta: undefined, // skip value from attrs
                        unitName: undefined, // skip value from attrs
                    })
                    id = existingResident.id
                } else {
                    const resident = await Resident.create(context, attrs)
                    id = resident.id
                }
                // Hack that helps to resolve all subfields in result of this mutation
                const result = await getById('Resident', id)
                return result
            },
        },
    ],
    
})

module.exports = {
    RegisterResidentService,
}
