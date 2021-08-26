const { BillingIntegration, BillingCurrency } = require('@condo/domains/billing/utils/serverSchema')
const { GraphQLApp } = require('@keystonejs/app-graphql')
const faker = require('faker')
const path = require('path')
const {
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_ERROR_STATUS,
} = require('@condo/domains/billing/constants')

const DV = 1
const SENDER = { dv: DV, fingerprint: faker.random.alphaNumeric(8) }

const RubleCurrency = {
    dv: DV,
    sender: SENDER,
    code: 'RUB',
    displayInfo: {
        symbolNative: '₽',
        decimalDigits: 2,
        rounding: 0,
        delimiterNative: ',',
    },
}

const DollarCurrency = {
    dv: DV,
    sender: SENDER,
    code: 'USD',
    displayInfo: {
        symbolNative: '$',
        decimalDigits: 2,
        rounding: 0,
        delimiterNative: '.',
    },
}

const InProgressBilling = {
    dv: DV,
    sender: SENDER,
    name: 'In progress',
    shortDescription: 'Государственная информационная система ЖКХ',
    detailsTitle: 'Подключение ГИС ЖКХ',
    detailsText: 'Вам нужно подать заявку на интеграцию через ваш личный кабинет в ГИС ЖКХ. Дальше, мы сделаем всё сами.\n' +
        'В результате, вы будете видеть все данные биллинга внутри платформы «Домá».',
    detailsConfirmButtonText: 'Подать заявку на интеграцию с ГИС ЖКХ',
    detailsInstructionButtonText: 'Инструкция на сайте биллинга',
    detailsInstructionButtonLink: 'https://dom.gosuslugi.ru',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
    billingPageTitle: 'Биллинг ГИС ЖКХ',
}

const SuccessfulBilling = {
    dv: DV,
    sender: SENDER,
    name: 'Success',
    shortDescription: 'Шаблон СБ Бизнес Онлайн 8_2',
    detailsTitle: 'Подключение реестрового обмена',
    detailsText: 'Выбрав данный вариант интеграции, вам будет необходимо загрузить ваши реестры к нам самостоятельно',
    detailsConfirmButtonText: 'Подключить',
    detailsInstructionButtonText: 'Подробнее про шаблон',
    detailsInstructionButtonLink: 'https://www.sberbank.ru/ru/s_m_business/new_sbbol',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    billingPageTitle: 'Биллинг, реестровый обмен',
}

const ErrorBilling = {
    dv: DV,
    sender: SENDER,
    name: 'Error',
    shortDescription: 'Шаблон СБ Бизнес Онлайн 9_1',
    detailsTitle: 'Подключение реестрового обмена',
    detailsText: 'Выбрав данный вариант интеграции, вам будет необходимо загрузить ваши реестры к нам самостоятельно',
    detailsConfirmButtonText: 'Подключить',
    detailsInstructionButtonText: 'Подробнее про шаблон',
    detailsInstructionButtonLink: 'https://www.sberbank.ru/ru/s_m_business/new_sbbol',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_ERROR_STATUS,
    billingPageTitle: 'Биллинг, реестровый обмен',
}

const NoDetailsBilling = {
    dv: DV,
    sender: SENDER,
    name: 'Lvl 1',
    detailsTitle: 'Подключение биллинга с детализацией 1',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    billingPageTitle: 'Биллинг, уровень 1',
}

const NoDetailsDollarBilling = {
    dv: DV,
    sender: SENDER,
    name: 'Lvl 1',
    detailsTitle: 'Подключение биллинга с детализацией 1 и долларами',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    billingPageTitle: 'Биллинг "Доллар", уровень 1',
}

const ToPayDetailsBilling = {
    dv: DV,
    sender: SENDER,
    name: 'Lvl 1+',
    detailsTitle: 'Подключение биллинга с детализацией 1+',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    billingPageTitle: 'Биллинг, уровень 1+',
}

const WithServicesBilling = {
    dv: DV,
    sender: SENDER,
    name: 'Lvl 2',
    detailsTitle: 'Подключение биллинга с детализацией 2',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    billingPageTitle: 'Биллинг, уровень 2',
}

const WithServicesDetailsBilling = {
    dv: DV,
    sender: SENDER,
    name: 'Lvl 3',
    detailsTitle: 'Подключение биллинга с детализацией 3',
    contextDefaultStatus: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    billingPageTitle: 'Биллинг, уровень 3',
}

const RUBLE_BILLINGS_TO_CREATE = [
    InProgressBilling,
    SuccessfulBilling,
    ErrorBilling,
    NoDetailsBilling,
    ToPayDetailsBilling,
    WithServicesBilling,
    WithServicesDetailsBilling,
]

const DOLLAR_BILLINGS_TO_CREATE = [
    NoDetailsDollarBilling,
]

class BillingsGenerator {
    context = null

    async connect () {
        console.info('[INFO] Connecting to database...')
        const resolved = path.resolve('./index.js')
        const { distDir, keystone, apps } = require(resolved)
        const graphqlIndex = apps.findIndex(app => app instanceof GraphQLApp)
        await keystone.prepare({ apps: [apps[graphqlIndex]], distDir, dev: true })
        await keystone.connect()
        this.context = await keystone.createContext({ skipAccessControl: true })
    }

    async generateCurrencies () {
        console.info('[INFO] Generating currencies...')
        const rub = await BillingCurrency.create(this.context, RubleCurrency)
        const usd = await BillingCurrency.create(this.context, DollarCurrency)
        return { rub, usd }
    }

    async generateBillings () {
        console.info('[INFO] Generating billings...')
        const { rub, usd } = await this.generateCurrencies()
        console.log(rub)
        for (const billing of RUBLE_BILLINGS_TO_CREATE) {
            await BillingIntegration.create(this.context, {
                ...billing,
                currency: { connect: { id: rub.id } },
            })
        }
        for (const billing of DOLLAR_BILLINGS_TO_CREATE) {
            await BillingIntegration.create(this.context, {
                ...billing,
                currency: { connect: { id: usd.id } },
            })
        }
    }


}

const createBillings = async () => {
    const BillingsManager = new BillingsGenerator()
    console.time('keystone')
    await BillingsManager.connect()
    console.timeEnd('keystone')
    await BillingsManager.generateBillings()
}

if (process.env.NODE_ENV !== 'development') {
    console.log('NODE_ENV needs to be set to "development"')
    process.exit(1)
}

createBillings()
    .then(() => {
        console.log('\r\n')
        console.log('All done')
        process.exit(0)
    }).catch((err) => {
        console.error('Failed to done', err)
    })