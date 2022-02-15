const { ApolloClient, InMemoryCache, ApolloLink } = require('apollo-boost')
const { onError }  = require('apollo-link-error')
const { createUploadLink } = require('apollo-upload-client')
const FormData = require('form-data')
const fetch = require('cross-fetch/polyfill').fetch
const { GET_MY_USERINFO } = require('@condo/domains/user/gql.js')
const { TicketFile: TicketFileGql } = require('@condo/domains/ticket/gql')
const fs = require('fs')

class DummyFile {
    constructor ({ filename = 'README.md', mimetype = 'text/plain', encoding = 'UTF-8', filePath = '/home/zuch/condo-with-submodules/condo/apps/condorb/README.md' }) {
        this.filename = filename
        this.mimetype = mimetype
        this.encoding = encoding
        this.stream = fs.createReadStream(filePath)
    }
}

class UploadClient {

    client = null
    authToken = 'Dsjc30FYI1qpB4AqbppjfzeG4blKrj9D.OQVYqOidHeLwazCl88feJJ8f03/sBcX1h1VpfHIEw+g'
    endpoint = 'https://condo.d.doma.ai/admin/api'
    organizationId = '4238e724-30e4-404e-934b-400c40cddb84'
    ticketId = '1056efe2-0f9e-45f4-90a9-20c57c132f76'

    dvSender () {
        return {
            dv: 1,
            sender: {
                dv: 1,
                fingerprint: 'upload-test-bot',
            },
        }
    }

    constructor () {
        this.client = new ApolloClient({
            link: ApolloLink.from([this.errorLink(), this.authLink(), this.uploadLink()]),
            cache: new InMemoryCache(),
        })
    }

    async me () {
        const { data: { user } } = await this.client.query({ query: GET_MY_USERINFO })
        return user
    }

    async saveTicketFile () {
        const createInput = {
            organization: {
                connect: { id: this.organizationId },
            },
            ticket: {
                connect: { id: this.ticketId },
            },
            file: new DummyFile({}),
        }
        const result = await this.client.mutate({
            mutation: TicketFileGql.CREATE_OBJ_MUTATION,
            variables: {
                data: {
                    ...this.dvSender(),
                    ...createInput,
                },
            },
        })
        return result
    }

    errorLink () {
        const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
            if (graphQLErrors) {
                const errors = graphQLErrors.map(({ message, path }) =>
                    `[GraphQL error]: Message: ${message}, Operation: ${operation.operationName}, Path: ${path}`
                )
                console.error(errors)
            }
            if (networkError) {
                console.error(`[Network error]: ${networkError}`)
            }
        })
        return errorLink
    }

    authLink () {
        return new ApolloLink((operation, forward) => {
            operation.setContext({
                headers: {
                    authorization: 'Bearer ' + this.authToken,
                },
            })
            return forward(operation)
        })
    }

    uploadLink () {
        return createUploadLink({
            uri: this.endpoint,
            fetch,
            FormData: FormData,
            formDataAppendFile: (form, name, file) => {
                form.append(name, file.stream)
            },
            isExtractableFile: (value) => {
                return value instanceof DummyFile
            },
        })
    }

}

const bootstrap = async () => {
    console.log(JSON.stringify(JSON.parse('{"__class__":"exportPaymentDocumentResultType","PaymentDocument":{"__class__":"PaymentDocument","AccountGuid":"b912ce06-ffc8-4911-a14d-fff9afdf52c7","PaymentDocumentForm":"Приказ Минстроя №43/пр","PaymentDocumentNumber":"61778ac081f89f0026bc5145","AddressInfo":{"__class__":"AddressInfo","LivingPersonsNumber":"0","TotalSquare":"16.1000"},"ChargeInfo":[{"__class__":"PDServiceChargeExportType","HousingService":{"__class__":"HousingService","ServiceType":{"__class__":"nsiRef","Code":"1","GUID":"3e8f1b43-a97c-4702-b44f-1840aef9f8fb"},"Rate":"2018.410000","TotalPayable":"359.90","AccountingPeriodTotal":"359.90","TotalPayableOverall":"359.90","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","MunicipalResource":[{"__class__":"MunicipalResource","ServiceType":{"__class__":"nsiRef","Code":"3","GUID":"424c6769-51a7-43b4-8d26-fdcbe7a7d9f4"},"Consumption":{"__class__":"Consumption","Volume":{"__class__":"Volume","value":"10.5572345","_determiningMethod":"M"}},"Rate":"5.210000","AccountingPeriodTotal":"37.90","ServiceCharge":{"__class__":"ServiceChargeType","MoneyRecalculation":"0.00","MoneyDiscount":"0.00"},"ServiceInformation":"","TotalPayable":"37.90","TotalPayableOverall":"37.90"}]}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"1.1","GUID":"e5cb737a-8790-4aed-95cd-7d25c97aa5ff"},"Rate":"0.000000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"2.2","GUID":"365228dd-e75d-4303-ac73-ff36f283a512"},"Rate":"0.000000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"4.2","GUID":"9a4dcb5d-c708-4e06-bfa2-e1c2059ff55b"},"Rate":"1.710000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"7.1","GUID":"fc005bac-3a77-4643-8537-6ab021ef85fd"},"Rate":"597.350000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"4.1","GUID":"e769eadc-1902-442c-a21d-1bfb752305ba"},"Rate":"3.590000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"6.2","GUID":"490dd919-dc60-4da1-b3bc-4cdbc39a128a"},"Rate":"1862.220000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"3.1","GUID":"548ecfd0-7ab0-4e4a-ae00-439b0ff24f20"},"Rate":"40.610000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"6.1","GUID":"c3c0a513-119e-4989-8c15-428f446bd313"},"Rate":"1862.220000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}},{"__class__":"PDServiceChargeExportType","MunicipalService":{"__class__":"MunicipalService","ServiceType":{"__class__":"nsiRef","Code":"2.1","GUID":"a5d78016-1544-43b0-a5eb-0a983ec58fee"},"Rate":"0.000000","TotalPayable":"0.00","AccountingPeriodTotal":"0.00","TotalPayableOverall":"0.00","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceInformation":""}}],"Expose":"True","TotalPayableByChargeInfo":"359.90","TotalPayableOverallByChargeInfo":"359.90","TotalPayableByPD":"359.90","TotalPayableByPDWithDebtAndAdvance":"359.90","Month":"10","Year":"2021","PaymentDocumentID":"40ОР071433-01-1101","PaymentInformation":[{"__class__":"PaymentInformation","RecipientINN":"6679133393","RecipientKPP":"667901001","BankName":"УРАЛЬСКИЙ БАНК ПАО СБЕРБАНК","PaymentRecipient":"ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ \\"УПРАВЛЯЮЩАЯ КОМПАНИЯ \\"СТРИЖИ\\"","BankBIK":"046577674","operatingAccountNumber":"40702810816540079326","CorrespondentBankAccount":"30101810500000000674","TotalPayableByPaymentInformation":"359.90","PaymentInformationGuid":"f990f813-c382-489b-8a8e-2bbc9fb2eebe","ServiceID":"40ОР071433-01","DebtPreviousPeriodsOrAdvanceBillingPeriod":"0.00","TotalPayableWithDebtAndAdvance":"359.90"}]},"INSERTED__property_condo_id":"6364465c-7ee2-412f-bccd-cfc4d2c25a64","INSERTED__account_condo_id":"16df500f-c44b-4262-82be-a250acb898d9"}'), null, 2))
    const upload = new UploadClient()
    const me = await upload.me()
    console.log('me', me)
    const ticketFile = await upload.saveTicketFile()
    console.log('ticketFile', ticketFile)
}

bootstrap().then(result => {
    console.log('result', result)
    process.exit(0)
}).catch(error => {
    console.error(error)
    process.exit(1)
})