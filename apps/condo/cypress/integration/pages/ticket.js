import sample from 'lodash/sample'
import faker from 'faker'

import { TicketCreate, TicketView } from '../../objects/Ticket'

const authUserWithCookies = (userData) => {
    cy.setCookie('locale', 'en')
    cy.setCookie('keystone.sid', userData.cookie.replace('keystone.sid=', ''))
    cy.setCookie('organizationLinkId', userData.organizationLinkId)
}

describe('Ticket create',  function () {
    describe('User', function () {
        before(() => {
            cy.task('keystone:createUserWithProperty').then((response) => {
                this.userData = response
                authUserWithCookies(response)
            })
        })

        it('can create ticket',  () => {
            const { address: propertyAddress, map: propertyMap } = this.userData.property
            const propertyUnits = propertyMap.sections
                .map(section => section.floors.map(floor => floor.units.map(unit => unit.label))).flat(2)

            const ticketCreate = new TicketCreate()
            ticketCreate
                .visit()
                .clickAndInputAddress(propertyAddress)
                .chooseAddressForTicket()
                .clickAndInputUnitName(sample(propertyUnits))
                .chooseUnitName()
                .clickAndInputDescription(faker.lorem.sentence(3))
                .selectProblemWithCategoryClassifier()
                .clickOnSubmitButton()
        })

        it('can view and filter tickets with table', () => {
            cy.task('keystone:createTickets', this.userData).then(() => {
                authUserWithCookies(this.userData)

                const ticketView = new TicketView()
                ticketView
                    .visit()
                    .clickIsWarrantyCheckbox()
                    .clickIsPaidCheckbox()
                    .clickIsEmergencyCheckbox()
            })
        })
    })
})
