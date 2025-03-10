const gfm = require('remark-gfm')
const ReactMarkdown = require('react-markdown')

import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Error from 'next/error'
import get from 'lodash/get'
import { Typography, Col, Row } from 'antd'
import { Gutter } from 'antd/es/grid/row'

import { useOrganization } from '@core/next/organization'
import { useIntl } from '@core/next/intl'

import { FeatureFlagRequired } from '@condo/domains/common/components/containers/FeatureFlag'
import { ReturnBackHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { PageContent, PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { AcquiringIntegration, AcquiringIntegrationContext } from '@condo/domains/acquiring/utils/clientSchema'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'


const SETTINGS_PAGE_ROUTE = '/settings/'

const ROW_GUTTER: [Gutter, Gutter] = [0, 40]
const DESCRIPTION_TEXT_STYLE = { fontSize: 16 }
const PAGE_HEADER_STYLE = { margin: '0 30' }
const PAGE_HEADER_TITLE_STYLE = { margin: 0 }

const AcquiringIntegrationDetailsPage = () => {
    const intl = useIntl()
    const ErrorMessage = intl.formatMessage({ id: 'errors.LoadingError' })
    const LoadingMessage = intl.formatMessage({ id: 'Loading' })
    const NoPermissionMessage = intl.formatMessage({ id: 'NoPermissionToSettings' })

    const { query } = useRouter()
    const integrationId = get(query, 'id')

    const userOrganization = useOrganization()
    const organizationId = get(userOrganization, ['organization', 'id'])
    const canManageIntegrations = get(userOrganization, ['link', 'role', 'canManageIntegrations'], false)

    const {
        obj: integration,
        loading: integrationLoading,
        error: integrationError,
    } = AcquiringIntegration.useObject({
        where: {
            id: String(integrationId),
        },
    })

    const {
        obj: currentContext,
        error: contextError,
        loading: contextLoading,
    } = AcquiringIntegrationContext.useObject({
        where: {
            organization: {
                id: organizationId,
            },
        },
    }, {
        fetchPolicy: 'network-only',
    })

    if (integrationLoading || integrationError || contextLoading || contextError) {
        return (
            <LoadingOrErrorPage
                title={LoadingMessage}
                loading={integrationLoading || contextLoading}
                error={integrationError || contextError ? ErrorMessage : null}
            />
        )
    }

    if (!integration) {
        return <Error statusCode={404}/>
    }

    const pageTitle = get(integration, 'detailsTitle')
    const markDownText = get(integration, 'detailsText')

    return (
        <FeatureFlagRequired name={'acquiring'} fallback={<Error statusCode={404}/>}>
            <Head>
                <title>{pageTitle}</title>
            </Head>
            <PageWrapper>
                <OrganizationRequired>
                    {
                        canManageIntegrations
                            ? (
                                <>
                                    <PageHeader
                                        title={<Typography.Title style={PAGE_HEADER_TITLE_STYLE}>{pageTitle}</Typography.Title>}
                                        style={PAGE_HEADER_STYLE}
                                    />
                                    <PageContent>
                                        <Col span={20}>
                                            <Row gutter={ROW_GUTTER}>
                                                {
                                                    markDownText && (
                                                        <Col span={24} style={DESCRIPTION_TEXT_STYLE}>
                                                            <ReactMarkdown remarkPlugins={[gfm]}>
                                                                {markDownText}
                                                            </ReactMarkdown>
                                                        </Col>
                                                    )
                                                }
                                            </Row>
                                        </Col>
                                    </PageContent>
                                </>
                            )
                            : (
                                <BasicEmptyListView>
                                    <Typography.Title level={3}>
                                        {NoPermissionMessage}
                                    </Typography.Title>
                                </BasicEmptyListView>
                            )
                    }
                </OrganizationRequired>
            </PageWrapper>
        </FeatureFlagRequired>
    )
}

AcquiringIntegrationDetailsPage.headerAction = <ReturnBackHeaderAction
    descriptor={{ id: 'menu.Settings' }}
    path={SETTINGS_PAGE_ROUTE}
/>

export default AcquiringIntegrationDetailsPage