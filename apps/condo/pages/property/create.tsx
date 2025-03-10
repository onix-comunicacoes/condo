import { Typography, Row, Col, RowProps } from 'antd'
import Head from 'next/head'
import React from 'react'
import { PropertyForm } from '@condo/domains/property/components/PropertyForm'
import { useIntl } from '@core/next/intl'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { ReturnBackHeaderAction } from '@condo/domains/common/components/HeaderActions'

const PROPERTY_CREATE_PAGE_GUTTER: RowProps['gutter'] = [0, 40]
const PROPERTY_CREATE_PAGE_TITLE_STYLE: React.CSSProperties = { margin: 0 }

export default function CreatePropertyPage () {
    const intl = useIntl()
    const PageTitleMsg = intl.formatMessage({ id: 'pages.condo.property.index.CreatePropertyTitle' })
    return (
        <>
            <Head>
                <title>{PageTitleMsg}</title>
            </Head>
            <PageWrapper>
                <PageContent>
                    <Row gutter={PROPERTY_CREATE_PAGE_GUTTER}>
                        <Col span={24}>
                            <Typography.Title level={1} style={PROPERTY_CREATE_PAGE_TITLE_STYLE}>
                                {PageTitleMsg}
                            </Typography.Title>
                        </Col>
                        <Col span={24}>
                            <PropertyForm />
                        </Col>
                    </Row>
                </PageContent>
            </PageWrapper>
        </>
    )
}

CreatePropertyPage.headerAction = <ReturnBackHeaderAction
    path={'/property/'}
    descriptor={{ id: 'menu.AllProperties' }}
    useBrowserHistory={false}
/>
CreatePropertyPage.requiredAccess = OrganizationRequired

