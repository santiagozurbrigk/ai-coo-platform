# GoHighLevel — índice de la documentación capturada

Copia local de `https://marketplace.gohighlevel.com/docs/` (versión **current / v3**).
Cada archivo conserva la URL de origen en su front-matter.

- Total de páginas: **948**
- Endpoints REST documentados: **634**
- Eventos de webhook: **77**

> Ver también [`ENDPOINTS.md`](./ENDPOINTS.md) — tabla plana de todos los endpoints ordenada por path.

---

## Punto de entrada

- [Changelog](./Changelog.md)
- [API Versioning](./Versioning.md)
- [Documentación (home)](./index.md)
- [Introduction](./intro.md)

## OAuth, apps de Marketplace y sandbox

- [Understanding HighLevel’s Go-To-Market Model](./oauth/AgencyVsSubAccount.md) — _Getting Started > Key Concepts_
- [App Creation Guide](./oauth/AppCreationGuide.md) — _Getting Started_
- [Marketplace App Distribution Model](./oauth/AppDistribution.md) — _Getting Started > Key Concepts_
- [Publishing your App to HighLevel Marketplace](./oauth/AppReviewGuidelines.md) — _Getting Started_
- [App Testing Guide](./oauth/AppTestingGuide.md) — _Getting Started_
- [Billing Webhook](./oauth/Billing.md)
- [Step 1: Create a Developer Account](./oauth/CreateDeveloperAccount.md) — _Getting Started > Create a Marketplace App_
- [Step 2: Create a Marketplace App](./oauth/CreateMarketplaceApp.md) — _Getting Started > Create a Marketplace App_
- [External Authentication](./oauth/ExternalAuthentication.md)
- [FAQs](./oauth/Faqs.md)
- [Getting Started](./oauth/GettingStarted.md)
- [How to Update Your App](./oauth/HowToUpdateYourAPP.md) — _Getting Started_
- [Key Concepts](./oauth/KeyConcepts.md) — _Getting Started_
- [GHL Marketplace Sandbox Accounts: Setup and Usage Guide](./oauth/SandboxAccount.md) — _Getting Started > App Testing Guide_
- [Private Integration Tokens (PIT) for Sandbox Accounts](./oauth/SandboxPIT.md) — _Getting Started > App Testing Guide_
- [Step 4: Installing and Testing a Marketplace App](./oauth/TestingApp.md) — _Getting Started > App Testing Guide_
- [API Key / Basic Auth](./oauth/external-auth/BasicAuth.md) — _External Authentication_
- [Code Mode](./oauth/external-auth/CodeMode.md) — _External Authentication_
- [Configure Your Fields](./oauth/external-auth/ConfigureYourFields.md) — _External Authentication_
- [Multi-Account Support & User Info](./oauth/external-auth/MultiAccountSupport.md) — _External Authentication_
- [OAuth 2.0](./oauth/external-auth/OAuth2.md) — _External Authentication_

## Autorización y tokens

- [Access Token Generation: Agency vs. Sub-Account Scenarios](./Authorization/AccessTokenUseCase.md) — _Authorization > OAuth 2.0_
- [Developer's Glossary of Terms](./Authorization/DeveloperGlossary.md) — _Authorization > OAuth 2.0_
- [OAuth 2.0](./Authorization/OAuth2.0.md) — _Authorization_
- [Private Integrations](./Authorization/PrivateIntegrationsToken.md) — _Authorization_
- [**Scopes**](./Authorization/Scopes.md) — _Authorization > OAuth 2.0_
- [Handling Access Tokens for Apps with Target User: Agency](./Authorization/TargetUserAgency.md) — _Authorization > OAuth 2.0 > Access Token Generation: Agency vs. Sub-Account Scenarios_
- [Handling Access Tokens for Apps with Target User: Sub-Account](./Authorization/TargetUserSubAccount.md) — _Authorization > OAuth 2.0 > Access Token Generation: Agency vs. Sub-Account Scenarios_
- [Authorization](./Authorization/authorization_doc.md)

## Referencia transversal (rate limits, MCP, países, contexto de usuario)

- [Country List](./other/country.md)
- [LeadConnector MCP Server](./other/mcp.md)
- [Rate Limits](./other/rate-limits.md)
- [User Context in Marketplace Apps](./other/user-context-marketplace-apps.md)

## Módulos del Marketplace (acciones, triggers, páginas, providers)

- [Conversation Providers](./marketplace-modules/ConversationProviders.md) — _Marketplace Modules_
- [Conversation AI & Voice AI](./marketplace-modules/ConversationsAIandVoiceAI.md) — _Marketplace Modules_
- [Creating a Marketplace Workflow Action](./marketplace-modules/CustomActions.md) — _Marketplace Modules > Workflow Actions and Triggers_
- [Custom Pages](./marketplace-modules/CustomPages.md) — _Marketplace Modules_
- [Creating a Marketplace Workflow Trigger](./marketplace-modules/CustomTriggers.md) — _Marketplace Modules > Workflow Actions and Triggers_
- [Building a Custom Payments Integration on the HighLevel Platform](./marketplace-modules/Payments.md) — _Marketplace Modules_
- [Selling Snapshots on the HighLevel App Marketplace](./marketplace-modules/Snapshots.md) — _Marketplace Modules_
- [Template Library](./marketplace-modules/TemplateLibrary.md) — _Marketplace Modules_
- [Web Widgets](./marketplace-modules/Widgets.md) — _Marketplace Modules_
- [HighLevel Marketplace Workflow Triggers & Actions](./marketplace-modules/WorkflowActionsAndTriggers.md) — _Marketplace Modules_
- [CustomJS](./marketplace-modules/custom-js.md) — _Marketplace Modules > Custom JS_
- [Vue 3 Store Events Migration Guide](./marketplace-modules/vue3-store-events.md) — _Marketplace Modules > Custom JS_

## SDKs oficiales

- [Getting Started with HighLevel SDKs](./sdk/GettingStartedSDK.md)
- [HighLevel Node.js SDK](./sdk/node.md) — _SDK Overview_
- [HighLevel PHP SDK](./sdk/php.md) — _SDK Overview_
- [HighLevel Python SDK](./sdk/python.md) — _SDK Overview_

## Políticas del Marketplace

- [Developer Policy: Private App Distribution Limit (with Security Review Path)](./MarketplacePolicies/PrivateAppInstallLimits.md) — _Marketplace Policies_
- [HighLevel App Marketplace Refund Policy](./MarketplacePolicies/RefundPolicy.md) — _Marketplace Policies_
- [Sandbox Account – Fair Use Policy](./MarketplacePolicies/SandBoxFUP.md) — _Marketplace Policies_

## Índices generados por la doc

- [webhook](./category/webhook.md)

---

## API REST v3 por recurso

### `ad-publishing` (96 endpoints)

Páginas de contexto: [Ad Manager API](./ghl/ad-publishing/ad-manager-api.md), [Facebook Ads](./ghl/ad-publishing/facebook-ads.md), [Facebook Integration](./ghl/ad-publishing/facebook-integration.md), [Facebook Reporting](./ghl/ad-publishing/facebook-reporting.md), [Google Ads](./ghl/ad-publishing/google-ads.md), [Google Integration](./ghl/ad-publishing/google-integration.md), [Google Reporting](./ghl/ad-publishing/google-reporting.md), [LinkedIn Ads](./ghl/ad-publishing/linked-in-ads.md), [LinkedIn Integration](./ghl/ad-publishing/linked-in-integration.md), [LinkedIn Reporting](./ghl/ad-publishing/linked-in-reporting.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/ad-publishing/facebook/ad-accounts` | [Get ad accounts](./ghl/ad-publishing/fb-get-ad-accounts.md) |
| `DELETE` | `/ad-publishing/facebook/ad-accounts/:adAccountId` | [Delete ad account](./ghl/ad-publishing/fb-delete-ad-account.md) |
| `GET` | `/ad-publishing/facebook/ad-accounts/:adAccountId` | [Get ad account details](./ghl/ad-publishing/fb-get-ad-account.md) |
| `PUT` | `/ad-publishing/facebook/ads` | [Upsert ad](./ghl/ad-publishing/fb-upsert-ad.md) |
| `DELETE` | `/ad-publishing/facebook/ads/:adId` | [Delete ad](./ghl/ad-publishing/fb-delete-ad.md) |
| `POST` | `/ad-publishing/facebook/ads/:adId/duplicate` | [Duplicate ad](./ghl/ad-publishing/fb-duplicate-ad.md) |
| `POST` | `/ad-publishing/facebook/ads/:adId/pause` | [Pause ad](./ghl/ad-publishing/fb-pause-ad.md) |
| `POST` | `/ad-publishing/facebook/ads/:adId/resume` | [Resume ad](./ghl/ad-publishing/fb-resume-ad.md) |
| `PUT` | `/ad-publishing/facebook/adsets` | [Upsert adset](./ghl/ad-publishing/fb-upsert-adset.md) |
| `DELETE` | `/ad-publishing/facebook/adsets/:adSetId` | [Delete ad set](./ghl/ad-publishing/fb-delete-adset.md) |
| `POST` | `/ad-publishing/facebook/adsets/:adSetId/duplicate` | [Duplicate ad set](./ghl/ad-publishing/fb-duplicate-adset.md) |
| `POST` | `/ad-publishing/facebook/adsets/:adSetId/pause` | [Pause ad set](./ghl/ad-publishing/fb-pause-adset.md) |
| `POST` | `/ad-publishing/facebook/adsets/:adSetId/resume` | [Resume ad set](./ghl/ad-publishing/fb-resume-adset.md) |
| `GET` | `/ad-publishing/facebook/campaign/:campaignId` | [Get campaign with linked entities](./ghl/ad-publishing/fb-get-campaign.md) |
| `PUT` | `/ad-publishing/facebook/campaigns` | [Upsert campaign](./ghl/ad-publishing/fb-upsert-campaign.md) |
| `DELETE` | `/ad-publishing/facebook/campaigns/:campaignId` | [Delete campaign](./ghl/ad-publishing/fb-delete-campaign.md) |
| `POST` | `/ad-publishing/facebook/campaigns/:campaignId/duplicate` | [Duplicate campaign](./ghl/ad-publishing/fb-duplicate-campaign.md) |
| `POST` | `/ad-publishing/facebook/campaigns/:campaignId/pause` | [Pause campaign](./ghl/ad-publishing/fb-pause-campaign.md) |
| `POST` | `/ad-publishing/facebook/campaigns/:campaignId/publish` | [Publish campaign](./ghl/ad-publishing/fb-publish-campaign.md) |
| `GET` | `/ad-publishing/facebook/campaigns/:campaignId/publishing-progress` | [Get campaign publishing progress](./ghl/ad-publishing/fb-get-campaign-publishing-progress.md) |
| `POST` | `/ad-publishing/facebook/campaigns/:campaignId/resume` | [Resume campaign](./ghl/ad-publishing/fb-resume-campaign.md) |
| `GET` | `/ad-publishing/facebook/conversation-forms` | [Get conversation forms](./ghl/ad-publishing/fb-get-conversation-forms.md) |
| `POST` | `/ad-publishing/facebook/conversation-forms` | [Create conversation form](./ghl/ad-publishing/fb-create-conversation-form.md) |
| `GET` | `/ad-publishing/facebook/custom-audience` | [Get custom audiences](./ghl/ad-publishing/fb-get-custom-audiences.md) |
| `DELETE` | `/ad-publishing/facebook/custom-audience/:audienceId` | [Delete custom audience](./ghl/ad-publishing/fb-delete-custom-audience.md) |
| `GET` | `/ad-publishing/facebook/custom-audience/:audienceId` | [Get custom audience by ID](./ghl/ad-publishing/fb-get-custom-audience-by-id.md) |
| `PUT` | `/ad-publishing/facebook/custom-audience/:audienceId` | [Update custom audience](./ghl/ad-publishing/fb-update-custom-audience.md) |
| `DELETE` | `/ad-publishing/facebook/custom-audience/:audienceId/member` | [Remove custom audience member](./ghl/ad-publishing/fb-remove-custom-audience-member.md) |
| `PUT` | `/ad-publishing/facebook/custom-audience/:audienceId/member` | [Add custom audience member](./ghl/ad-publishing/fb-add-custom-audience-member.md) |
| `PUT` | `/ad-publishing/facebook/custom-audience/:audienceId/member/batch` | [Batch update audience members](./ghl/ad-publishing/fb-batch-update-audience-members.md) |
| `GET` | `/ad-publishing/facebook/entity` | [Get entities](./ghl/ad-publishing/fb-get-entity.md) |
| `DELETE` | `/ad-publishing/facebook/integration` | [Delete Facebook integration](./ghl/ad-publishing/fb-delete-integration.md) |
| `GET` | `/ad-publishing/facebook/integration` | [Get Facebook integration](./ghl/ad-publishing/fb-get-integration.md) |
| `POST` | `/ad-publishing/facebook/integration` | [Create Facebook integration](./ghl/ad-publishing/fb-create-integration.md) |
| `GET` | `/ad-publishing/facebook/lead-form/:leadFormId` | [Get lead form by ID](./ghl/ad-publishing/fb-get-lead-form.md) |
| `GET` | `/ad-publishing/facebook/me` | [Get current Facebook user](./ghl/ad-publishing/fb-get-current-user.md) |
| `DELETE` | `/ad-publishing/facebook/page` | [Delete page connection](./ghl/ad-publishing/fb-delete-page.md) |
| `GET` | `/ad-publishing/facebook/page/:pageId/forms` | [Get page lead forms](./ghl/ad-publishing/fb-get-page-lead-forms.md) |
| `POST` | `/ad-publishing/facebook/page/:pageId/forms` | [Create page lead form](./ghl/ad-publishing/fb-create-page-lead-form.md) |
| `GET` | `/ad-publishing/facebook/page/:pageId/instagram` | [Get Instagram accounts for page](./ghl/ad-publishing/fb-get-instagram-accounts.md) |
| `PUT` | `/ad-publishing/facebook/page/default` | [Set default page](./ghl/ad-publishing/fb-set-default-page.md) |
| `GET` | `/ad-publishing/facebook/pages` | [Get Facebook pages](./ghl/ad-publishing/fb-get-pages.md) |
| `GET` | `/ad-publishing/facebook/pixels` | [Get conversion pixels](./ghl/ad-publishing/fb-get-pixels.md) |
| `PUT` | `/ad-publishing/facebook/pixels` | [Upsert conversion pixel](./ghl/ad-publishing/fb-upsert-pixel.md) |
| `GET` | `/ad-publishing/facebook/reporting` | [Get reporting data](./ghl/ad-publishing/fb-get-reporting.md) |
| `GET` | `/ad-publishing/facebook/reporting/campaign/:campaignId` | [Get campaign reporting](./ghl/ad-publishing/fb-get-campaign-reporting.md) |
| `GET` | `/ad-publishing/facebook/reporting/list` | [Get reporting list](./ghl/ad-publishing/fb-get-reporting-list.md) |
| `GET` | `/ad-publishing/facebook/targeting/search` | [Search targeting options](./ghl/ad-publishing/fb-search-targeting.md) |
| `GET` | `/ad-publishing/google/ad-accounts` | [Get Google ad accounts](./ghl/ad-publishing/google-get-ad-accounts.md) |
| `DELETE` | `/ad-publishing/google/ad-accounts/:adAccountId` | [Delete ad account](./ghl/ad-publishing/google-delete-ad-account.md) |
| `GET` | `/ad-publishing/google/ad-accounts/:adAccountId` | [Get ad account details](./ghl/ad-publishing/google-get-ad-account-details.md) |
| `PUT` | `/ad-publishing/google/ads` | [Upsert Google campaign](./ghl/ad-publishing/google-upsert-campaign.md) |
| `GET` | `/ad-publishing/google/ads/:adId` | [Get Google campaign by ID](./ghl/ad-publishing/google-get-campaign-by-id.md) |
| `POST` | `/ad-publishing/google/ads/:adId/publish` | [Publish ad](./ghl/ad-publishing/google-publish-ad.md) |
| `GET` | `/ad-publishing/google/ads/:adId/publishing-progress` | [Get ad publishing progress](./ghl/ad-publishing/google-get-publishing-progress.md) |
| `GET` | `/ad-publishing/google/assets` | [Get assets](./ghl/ad-publishing/google-get-assets.md) |
| `POST` | `/ad-publishing/google/assets` | [Upsert assets](./ghl/ad-publishing/google-upsert-assets.md) |
| `GET` | `/ad-publishing/google/audiences` | [Get audiences](./ghl/ad-publishing/google-get-audiences.md) |
| `PUT` | `/ad-publishing/google/audiences` | [Upsert audience](./ghl/ad-publishing/google-upsert-audience.md) |
| `GET` | `/ad-publishing/google/audiences/:audienceId` | [Get audience by ID](./ghl/ad-publishing/google-get-audience-by-id.md) |
| `GET` | `/ad-publishing/google/conversion-goals` | [Get conversion goals](./ghl/ad-publishing/google-get-conversion-goals.md) |
| `GET` | `/ad-publishing/google/conversions` | [Get conversions](./ghl/ad-publishing/google-get-conversions.md) |
| `PUT` | `/ad-publishing/google/conversions` | [Upsert conversion](./ghl/ad-publishing/google-upsert-conversion.md) |
| `DELETE` | `/ad-publishing/google/conversions/:conversionId` | [Delete conversion](./ghl/ad-publishing/google-delete-conversion.md) |
| `GET` | `/ad-publishing/google/conversions/:conversionId` | [Get conversion by ID](./ghl/ad-publishing/google-get-conversion-by-id.md) |
| `GET` | `/ad-publishing/google/entity` | [Get entities](./ghl/ad-publishing/google-get-entity.md) |
| `GET` | `/ad-publishing/google/integration` | [Get Google integration](./ghl/ad-publishing/google-get-integration.md) |
| `POST` | `/ad-publishing/google/integration` | [Create Google integration](./ghl/ad-publishing/google-create-integration.md) |
| `POST` | `/ad-publishing/google/keyword-ideas` | [Get keyword ideas](./ghl/ad-publishing/google-get-keyword-ideas.md) |
| `GET` | `/ad-publishing/google/me` | [Get current Google user](./ghl/ad-publishing/google-get-current-user.md) |
| `GET` | `/ad-publishing/google/reporting` | [Get reporting data](./ghl/ad-publishing/google-get-reporting.md) |
| `GET` | `/ad-publishing/google/reporting/campaign/:campaignId` | [Get campaign reporting](./ghl/ad-publishing/google-get-campaign-reporting.md) |
| `GET` | `/ad-publishing/google/reporting/list` | [Get reporting list](./ghl/ad-publishing/google-get-reporting-list.md) |
| `GET` | `/ad-publishing/google/segments` | [Get segments](./ghl/ad-publishing/google-get-segments.md) |
| `PUT` | `/ad-publishing/google/segments` | [Upsert segment](./ghl/ad-publishing/google-upsert-segment.md) |
| `DELETE` | `/ad-publishing/google/segments/:segmentId` | [Delete segment](./ghl/ad-publishing/google-delete-segment.md) |
| `GET` | `/ad-publishing/google/segments/:segmentId` | [Get segment by ID](./ghl/ad-publishing/google-get-segment-by-id.md) |
| `POST` | `/ad-publishing/google/segments/offline-user-list-job` | [Create offline user list job](./ghl/ad-publishing/google-create-offline-user-list-job.md) |
| `GET` | `/ad-publishing/google/target-interests` | [Get target interests](./ghl/ad-publishing/google-get-target-interests.md) |
| `GET` | `/ad-publishing/google/targeting/search` | [Search targeting options](./ghl/ad-publishing/google-search-targeting.md) |
| `POST` | `/ad-publishing/linkedin/:accountId/form` | [Create lead form](./ghl/ad-publishing/li-create-lead-form.md) |
| `GET` | `/ad-publishing/linkedin/:accountId/forms` | [Get lead forms](./ghl/ad-publishing/li-get-lead-forms.md) |
| `PATCH` | `/ad-publishing/linkedin/:adId/status` | [Update ad status](./ghl/ad-publishing/li-update-ad-status.md) |
| `DELETE` | `/ad-publishing/linkedin/ad-account` | [Delete ad account](./ghl/ad-publishing/li-delete-ad-account.md) |
| `GET` | `/ad-publishing/linkedin/ad-account` | [Get ad account details](./ghl/ad-publishing/li-get-ad-account-details.md) |
| `GET` | `/ad-publishing/linkedin/ad-accounts` | [Get LinkedIn ad accounts](./ghl/ad-publishing/li-get-ad-accounts.md) |
| `PUT` | `/ad-publishing/linkedin/ads` | [Upsert ad campaign group](./ghl/ad-publishing/li-upsert-campaign-group.md) |
| `GET` | `/ad-publishing/linkedin/ads/:adId` | [Get ad campaign group](./ghl/ad-publishing/li-get-campaign-group.md) |
| `POST` | `/ad-publishing/linkedin/ads/:adId/publish` | [Publish ad campaign group](./ghl/ad-publishing/li-publish-campaign-group.md) |
| `GET` | `/ad-publishing/linkedin/integration` | [Get LinkedIn integration](./ghl/ad-publishing/li-get-integration.md) |
| `POST` | `/ad-publishing/linkedin/integration` | [Create LinkedIn integration](./ghl/ad-publishing/li-create-integration.md) |
| `GET` | `/ad-publishing/linkedin/me` | [Get current LinkedIn user](./ghl/ad-publishing/li-get-current-user.md) |
| `GET` | `/ad-publishing/linkedin/reporting` | [Get ad analytics](./ghl/ad-publishing/li-get-ad-analytics.md) |
| `GET` | `/ad-publishing/linkedin/reporting/campaign-group/:campaignGroupId` | [Get campaign group reporting](./ghl/ad-publishing/li-get-campaign-group-reporting.md) |
| `GET` | `/ad-publishing/linkedin/reporting/list` | [Get reporting list](./ghl/ad-publishing/li-get-reporting-list.md) |
| `GET` | `/ad-publishing/linkedin/targeting/search` | [Search targeting options](./ghl/ad-publishing/li-search-targeting.md) |

### `affiliate-manager` (4 endpoints)

Páginas de contexto: [Affiliate Manager API](./ghl/affiliate-manager/affiliate-manager-api.md), [Affiliates](./ghl/affiliate-manager/affiliates.md), [Commissions](./ghl/affiliate-manager/commissions.md), [Payouts](./ghl/affiliate-manager/payouts.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/affiliate-manager/:locationId/affiliates` | [List Affiliates](./ghl/affiliate-manager/list-affiliates.md) |
| `GET` | `/affiliate-manager/:locationId/affiliates/:affiliateId` | [Get Affiliate](./ghl/affiliate-manager/get-affiliate.md) |
| `GET` | `/affiliate-manager/:locationId/commissions` | [List Commissions](./ghl/affiliate-manager/list-commissions.md) |
| `GET` | `/affiliate-manager/:locationId/payouts` | [List Payouts](./ghl/affiliate-manager/list-payouts.md) |

### `agent-studio` (11 endpoints)

Páginas de contexto: [Agent Studio APIs](./ghl/agent-studio/agent-studio-apis.md), [Agents](./ghl/agent-studio/agents.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/agent-studio/agent` | [List Agents](./ghl/agent-studio/get-agents.md) |
| `POST` | `/agent-studio/agent` | [Create Agent](./ghl/agent-studio/create-agent.md) |
| `DELETE` | `/agent-studio/agent/:agentId` | [Delete Agent](./ghl/agent-studio/delete-agent.md) |
| `GET` | `/agent-studio/agent/:agentId` | [Get Agent](./ghl/agent-studio/get-agent-by-id.md) |
| `PATCH` | `/agent-studio/agent/:agentId` | [Update Agent Metadata](./ghl/agent-studio/update-agent-metadata.md) |
| `POST` | `/agent-studio/agent/:agentId/execute` | [Execute Agent](./ghl/agent-studio/execute-agent.md) |
| `PATCH` | `/agent-studio/agent/versions/:versionId` | [Update Agent](./ghl/agent-studio/update-agent-version.md) |
| `POST` | `/agent-studio/agent/versions/:versionId/publish` | [Promote to Production](./ghl/agent-studio/promote-and-publish.md) |
| `GET` | `/agent-studio/public-api/agents` | [List Agents (Deprecated)](./ghl/agent-studio/get-agents-deprecated.md) |
| `GET` | `/agent-studio/public-api/agents/:agentId` | [Get Agent (Deprecated)](./ghl/agent-studio/get-agent-by-id-deprecated.md) |
| `POST` | `/agent-studio/public-api/agents/:agentId/execute` | [Execute Agent (Deprecated)](./ghl/agent-studio/execute-agent-deprecated.md) |

### `associations` (10 endpoints)

Páginas de contexto: [Associations API](./ghl/associations/associations-api.md), [Associations](./ghl/associations/associations.md), [Relations](./ghl/associations/relations.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/associations/` | [Get all associations for a sub-account / location](./ghl/associations/find-associations.md) |
| `POST` | `/associations/` | [Create Association](./ghl/associations/create-association.md) |
| `DELETE` | `/associations/:associationId` | [Delete Association](./ghl/associations/delete-association.md) |
| `GET` | `/associations/:associationId` | [Get association by ID](./ghl/associations/get-association-by-id.md) |
| `PUT` | `/associations/:associationId` | [Update Association By Id](./ghl/associations/update-association.md) |
| `GET` | `/associations/key/:key_name` | [Get association key by key name](./ghl/associations/get-association-key-by-key-name.md) |
| `GET` | `/associations/objectKey/:objectKey` | [Get association by object keys](./ghl/associations/get-association-by-object-keys.md) |
| `POST` | `/associations/relations` | [Create Relation for you associated entities.](./ghl/associations/create-relation.md) |
| `GET` | `/associations/relations/:recordId` | [Get all relations By record Id](./ghl/associations/get-relations-by-record-id.md) |
| `DELETE` | `/associations/relations/:relationId` | [Delete Relation](./ghl/associations/delete-relation.md) |

### `blogs` (7 endpoints)

Páginas de contexto: [Blogs API](./ghl/blogs/blogs-api.md), [Blogs](./ghl/blogs/blogs.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/blogs/authors` | [Get all authors](./ghl/blogs/get-all-blog-authors-by-location.md) |
| `GET` | `/blogs/categories` | [Get all categories](./ghl/blogs/get-all-categories-by-location.md) |
| `POST` | `/blogs/posts` | [Create Blog Post](./ghl/blogs/create-blog-post.md) |
| `PUT` | `/blogs/posts/:postId` | [Update Blog Post](./ghl/blogs/update-blog-post.md) |
| `GET` | `/blogs/posts/all` | [Get Blog posts by Blog ID](./ghl/blogs/get-blog-post.md) |
| `GET` | `/blogs/posts/url-slug-exists` | [Check url slug](./ghl/blogs/check-url-slug-exists.md) |
| `GET` | `/blogs/site/all` | [Get Blogs by Location ID](./ghl/blogs/get-blogs.md) |

### `brand-boards` (12 endpoints)

Páginas de contexto: [Brand Boards API v3](./ghl/brand-boards/brand-boards-api-v-3.md), [Brand Voices](./ghl/brand-boards/brand-voices.md), [Design Kits](./ghl/brand-boards/design-kits.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/brand-boards/locations/:locationId/brand-voices` | [List Brand Voices](./ghl/brand-boards/list-brand-voices.md) |
| `POST` | `/brand-boards/locations/:locationId/brand-voices` | [Create Brand Voice](./ghl/brand-boards/create-brand-voice.md) |
| `DELETE` | `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId` | [Delete Brand Voice](./ghl/brand-boards/delete-brand-voice.md) |
| `GET` | `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId` | [Get Brand Voice](./ghl/brand-boards/get-brand-voice.md) |
| `PATCH` | `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId` | [Update Brand Voice](./ghl/brand-boards/update-brand-voice.md) |
| `POST` | `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId/default` | [Set Default Brand Voice](./ghl/brand-boards/set-default-brand-voice.md) |
| `GET` | `/brand-boards/locations/:locationId/design-kits` | [List Design Kits](./ghl/brand-boards/list-design-kits.md) |
| `POST` | `/brand-boards/locations/:locationId/design-kits` | [Create Design Kit](./ghl/brand-boards/create-design-kit.md) |
| `DELETE` | `/brand-boards/locations/:locationId/design-kits/:designKitId` | [Delete Design Kit](./ghl/brand-boards/delete-design-kit.md) |
| `GET` | `/brand-boards/locations/:locationId/design-kits/:designKitId` | [Get Design Kit](./ghl/brand-boards/get-design-kit.md) |
| `PATCH` | `/brand-boards/locations/:locationId/design-kits/:designKitId` | [Update Design Kit](./ghl/brand-boards/update-design-kit.md) |
| `POST` | `/brand-boards/locations/:locationId/design-kits/:designKitId/default` | [Set Default Design Kit](./ghl/brand-boards/set-default-design-kit.md) |

### `businesses` (5 endpoints)

Páginas de contexto: [Business API](./ghl/businesses/business-api.md), [Businesses](./ghl/businesses/businesses.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/businesses/` | [Get Businesses by Location](./ghl/businesses/get-businesses-by-location.md) |
| `POST` | `/businesses/` | [Create Business](./ghl/businesses/create-business.md) |
| `DELETE` | `/businesses/:businessId` | [Delete Business](./ghl/businesses/delete-business.md) |
| `GET` | `/businesses/:businessId` | [Get Business](./ghl/businesses/get-business.md) |
| `PUT` | `/businesses/:businessId` | [Update Business](./ghl/businesses/update-business.md) |

### `calendars` (59 endpoints)

Páginas de contexto: [Appointment Notes](./ghl/calendars/appointment-notes.md), [Availability](./ghl/calendars/availability.md), [Calendar Events](./ghl/calendars/calendar-events.md), [Calendar Groups](./ghl/calendars/calendar-groups.md), [Calendar Notifications](./ghl/calendars/calendar-notifications.md), [Calendar Resources: Rooms & Equipments](./ghl/calendars/calendar-resources-rooms-equipments.md), [Calendars API](./ghl/calendars/calendars-api.md), [Calendars](./ghl/calendars/calendars.md), [Service Bookings](./ghl/calendars/service-bookings.md), [Service Locations](./ghl/calendars/service-locations.md), [Services](./ghl/calendars/services.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/calendars/` | [Get Calendars](./ghl/calendars/get-calendars.md) |
| `POST` | `/calendars/` | [Create Calendar](./ghl/calendars/create-calendar.md) |
| `DELETE` | `/calendars/:calendarId` | [Delete Calendar](./ghl/calendars/delete-calendar.md) |
| `GET` | `/calendars/:calendarId` | [Get Calendar](./ghl/calendars/get-calendar.md) |
| `PUT` | `/calendars/:calendarId` | [Update Calendar](./ghl/calendars/update-calendar.md) |
| `GET` | `/calendars/:calendarId/free-slots` | [Get Free Slots](./ghl/calendars/get-slots.md) |
| `GET` | `/calendars/:calendarId/notifications` | [Get notifications](./ghl/calendars/get-event-notification.md) |
| `POST` | `/calendars/:calendarId/notifications` | [Create notification](./ghl/calendars/create-event-notification.md) |
| `DELETE` | `/calendars/:calendarId/notifications/:notificationId` | [Delete Notification](./ghl/calendars/delete-event-notification.md) |
| `GET` | `/calendars/:calendarId/notifications/:notificationId` | [Get notification](./ghl/calendars/find-event-notification.md) |
| `PUT` | `/calendars/:calendarId/notifications/:notificationId` | [Update notification](./ghl/calendars/update-event-notification.md) |
| `GET` | `/calendars/appointments/:appointmentId/notes` | [Get Notes](./ghl/calendars/get-appointment-notes.md) |
| `POST` | `/calendars/appointments/:appointmentId/notes` | [Create Note](./ghl/calendars/create-appointment-note.md) |
| `DELETE` | `/calendars/appointments/:appointmentId/notes/:noteId` | [Delete Note](./ghl/calendars/delete-appointment-note.md) |
| `PUT` | `/calendars/appointments/:appointmentId/notes/:noteId` | [Update Note](./ghl/calendars/update-appointment-note.md) |
| `GET` | `/calendars/blocked-slots` | [Get Blocked Slots](./ghl/calendars/get-blocked-slots.md) |
| `GET` | `/calendars/events` | [Get Calendar Events](./ghl/calendars/get-calendar-events.md) |
| `DELETE` | `/calendars/events/:eventId` | [Delete Event](./ghl/calendars/delete-event.md) |
| `POST` | `/calendars/events/appointments` | [Create appointment](./ghl/calendars/create-appointment.md) |
| `GET` | `/calendars/events/appointments/:eventId` | [Get Appointment](./ghl/calendars/get-appointment.md) |
| `PUT` | `/calendars/events/appointments/:eventId` | [Update Appointment](./ghl/calendars/edit-appointment.md) |
| `POST` | `/calendars/events/block-slots` | [Create Block Slot](./ghl/calendars/create-block-slot.md) |
| `PUT` | `/calendars/events/block-slots/:eventId` | [Update Block Slot](./ghl/calendars/edit-block-slot.md) |
| `GET` | `/calendars/groups` | [Get Groups](./ghl/calendars/get-groups.md) |
| `POST` | `/calendars/groups` | [Create Calendar Group](./ghl/calendars/create-calendar-group.md) |
| `DELETE` | `/calendars/groups/:groupId` | [Delete Group](./ghl/calendars/delete-group.md) |
| `PUT` | `/calendars/groups/:groupId` | [Update Group](./ghl/calendars/edit-group.md) |
| `PUT` | `/calendars/groups/:groupId/status` | [Disable Group](./ghl/calendars/disable-group.md) |
| `POST` | `/calendars/groups/validate-slug` | [Validate group slug](./ghl/calendars/validate-groups-slug.md) |
| `GET` | `/calendars/resources/:resourceType` | [List Calendar Resources](./ghl/calendars/fetch-calendar-resources.md) |
| `POST` | `/calendars/resources/:resourceType` | [Create Calendar Resource](./ghl/calendars/create-calendar-resource.md) |
| `DELETE` | `/calendars/resources/:resourceType/:id` | [Delete Calendar Resource](./ghl/calendars/delete-calendar-resource.md) |
| `GET` | `/calendars/resources/:resourceType/:id` | [Get Calendar Resource](./ghl/calendars/get-calendar-resource.md) |
| `PUT` | `/calendars/resources/:resourceType/:id` | [Update Calendar Resource](./ghl/calendars/update-calendar-resource.md) |
| `POST` | `/calendars/schedules` | [Create user availability schedule](./ghl/calendars/create-schedule.md) |
| `DELETE` | `/calendars/schedules/:id` | [Delete user availability schedule](./ghl/calendars/delete-schedule.md) |
| `GET` | `/calendars/schedules/:id` | [Get user availability schedule](./ghl/calendars/get-schedule-by-id.md) |
| `PUT` | `/calendars/schedules/:id` | [Update user availability schedule](./ghl/calendars/update-schedule.md) |
| `DELETE` | `/calendars/schedules/:id/associations/:calendarId` | [Remove user availability schedule from a calendar](./ghl/calendars/remove-calendar-from-schedule.md) |
| `PUT` | `/calendars/schedules/:id/associations/:calendarId` | [Apply user availability schedule to a calendar](./ghl/calendars/add-calendar-to-schedule.md) |
| `GET` | `/calendars/schedules/event-calendar/:calendarId` | [Get event calendar availability schedule](./ghl/calendars/get-calendar-schedule.md) |
| `POST` | `/calendars/schedules/event-calendar/:calendarId` | [Create event calendar availability schedule](./ghl/calendars/create-calendar-schedule.md) |
| `PUT` | `/calendars/schedules/event-calendar/:calendarId` | [Update event calendar availability schedule](./ghl/calendars/update-calendar-schedule.md) |
| `GET` | `/calendars/schedules/search` | [List user availability schedule](./ghl/calendars/get-all-schedules.md) |
| `GET` | `/calendars/services/bookings` | [Get Service Bookings](./ghl/calendars/get-service-bookings.md) |
| `POST` | `/calendars/services/bookings` | [Create Service Booking](./ghl/calendars/create-service-booking.md) |
| `DELETE` | `/calendars/services/bookings/:bookingId` | [Delete Service Booking](./ghl/calendars/delete-service-booking.md) |
| `GET` | `/calendars/services/bookings/:bookingId` | [Get Service Booking by ID](./ghl/calendars/get-service-booking-by-id.md) |
| `PUT` | `/calendars/services/bookings/:bookingId` | [Update Service Booking](./ghl/calendars/update-service-booking.md) |
| `GET` | `/calendars/services/catalog` | [Get Services](./ghl/calendars/get-services-catalog.md) |
| `POST` | `/calendars/services/catalog` | [Create Service](./ghl/calendars/create-service-catalog.md) |
| `DELETE` | `/calendars/services/catalog/:serviceId` | [Delete Service](./ghl/calendars/delete-service-catalog.md) |
| `GET` | `/calendars/services/catalog/:serviceId` | [Get Service by ID](./ghl/calendars/get-service-catalog-by-id.md) |
| `PUT` | `/calendars/services/catalog/:serviceId` | [Update Service](./ghl/calendars/update-service-catalog.md) |
| `GET` | `/calendars/services/locations` | [Get Service Locations](./ghl/calendars/get-service-locations.md) |
| `POST` | `/calendars/services/locations` | [Create Service Location](./ghl/calendars/create-service-location.md) |
| `DELETE` | `/calendars/services/locations/:serviceLocationId` | [Delete Service Location](./ghl/calendars/delete-service-location.md) |
| `GET` | `/calendars/services/locations/:serviceLocationId` | [Get Service Location by ID](./ghl/calendars/get-service-location-by-id.md) |
| `PUT` | `/calendars/services/locations/:serviceLocationId` | [Update Service Location](./ghl/calendars/update-service-location.md) |

### `campaigns` (1 endpoints)

Páginas de contexto: [Campaigns API](./ghl/campaigns/campaigns-api.md), [Campaigns](./ghl/campaigns/campaigns.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/campaigns/` | [Get Campaigns](./ghl/campaigns/get-campaigns.md) |

### `chat-widget` (7 endpoints)

Páginas de contexto: [Chat Widget API](./ghl/chat-widget/chat-widget-api.md), [Chat Widget](./ghl/chat-widget/chat-widget.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/chat-widget/` | [Create a new chat widget](./ghl/chat-widget/create-chat-widget.md) |
| `DELETE` | `/chat-widget/:locationId/:id` | [Delete a Chat Widget](./ghl/chat-widget/delete-chat-widget.md) |
| `POST` | `/chat-widget/clone` | [Clone a Chat Widget](./ghl/chat-widget/clone-chat-widget.md) |
| `GET` | `/chat-widget/data/:locationId/:id` | [Get Chat Widget by ID](./ghl/chat-widget/get-chat-widget-by-id.md) |
| `PATCH` | `/chat-widget/data/:locationId/:id` | [Patch Chat Widget](./ghl/chat-widget/patch-chat-widget.md) |
| `PUT` | `/chat-widget/data/:locationId/:id` | [Update Chat Widget](./ghl/chat-widget/update-chat-widget.md) |
| `GET` | `/chat-widget/list` | [List Chat Widgets](./ghl/chat-widget/list-chat-widgets.md) |

### `companies` (1 endpoints)

Páginas de contexto: [Companies API](./ghl/companies/companies-api.md), [Companies](./ghl/companies/companies.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/companies/:companyId` | [Get Company](./ghl/companies/get-company.md) |

### `contacts` (32 endpoints)

Páginas de contexto: [Appointments](./ghl/contacts/appointments.md), [Bulk](./ghl/contacts/bulk.md), [Campaigns](./ghl/contacts/campaigns.md), [Contacts API v3](./ghl/contacts/contacts-api-v-3.md), [Contacts](./ghl/contacts/contacts.md), [Followers](./ghl/contacts/followers.md), [Notes](./ghl/contacts/notes.md), [Search](./ghl/contacts/search.md), [Tags](./ghl/contacts/tags.md), [Tasks](./ghl/contacts/tasks.md), [Workflow](./ghl/contacts/workflow.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/contacts/` | [Create Contact](./ghl/contacts/create-contact.md) |
| `DELETE` | `/contacts/:contactId` | [Delete Contact](./ghl/contacts/delete-contact.md) |
| `GET` | `/contacts/:contactId` | [Get Contact](./ghl/contacts/get-contact.md) |
| `PUT` | `/contacts/:contactId` | [Update Contact](./ghl/contacts/update-contact.md) |
| `GET` | `/contacts/:contactId/appointments` | [Get Appointments for Contact](./ghl/contacts/get-appointments-for-contact.md) |
| `DELETE` | `/contacts/:contactId/campaigns/:campaignId` | [Remove Contact From Campaign](./ghl/contacts/remove-contact-from-campaign.md) |
| `POST` | `/contacts/:contactId/campaigns/:campaignId` | [Add Contact to Campaign](./ghl/contacts/add-contact-to-campaign.md) |
| `DELETE` | `/contacts/:contactId/campaigns/remove-all` | [Remove Contact From Every Campaign](./ghl/contacts/remove-contact-from-every-campaign.md) |
| `DELETE` | `/contacts/:contactId/followers` | [Remove Followers](./ghl/contacts/remove-followers-contact.md) |
| `POST` | `/contacts/:contactId/followers` | [Add Followers](./ghl/contacts/add-followers-contact.md) |
| `GET` | `/contacts/:contactId/notes` | [Get All Notes](./ghl/contacts/get-all-notes.md) |
| `POST` | `/contacts/:contactId/notes` | [Create Note](./ghl/contacts/create-note.md) |
| `DELETE` | `/contacts/:contactId/notes/:id` | [Delete Note](./ghl/contacts/delete-note.md) |
| `GET` | `/contacts/:contactId/notes/:id` | [Get Note](./ghl/contacts/get-note.md) |
| `PUT` | `/contacts/:contactId/notes/:id` | [Update Note](./ghl/contacts/update-note.md) |
| `DELETE` | `/contacts/:contactId/tags` | [Remove Tags](./ghl/contacts/remove-tags.md) |
| `POST` | `/contacts/:contactId/tags` | [Add Tags](./ghl/contacts/add-tags.md) |
| `GET` | `/contacts/:contactId/tasks` | [Get all Tasks](./ghl/contacts/get-all-tasks.md) |
| `POST` | `/contacts/:contactId/tasks` | [Create Task](./ghl/contacts/create-task.md) |
| `DELETE` | `/contacts/:contactId/tasks/:taskId` | [Delete Task](./ghl/contacts/delete-task.md) |
| `GET` | `/contacts/:contactId/tasks/:taskId` | [Get Task](./ghl/contacts/get-task.md) |
| `PUT` | `/contacts/:contactId/tasks/:taskId` | [Update Task](./ghl/contacts/update-task.md) |
| `PUT` | `/contacts/:contactId/tasks/:taskId/completed` | [Update Task Completed](./ghl/contacts/update-task-completed.md) |
| `DELETE` | `/contacts/:contactId/workflow/:workflowId` | [Delete Contact from Workflow](./ghl/contacts/delete-contact-from-workflow.md) |
| `POST` | `/contacts/:contactId/workflow/:workflowId` | [Add Contact to Workflow](./ghl/contacts/add-contact-to-workflow.md) |
| `POST` | `/contacts/bulk/business` | [Add/Remove Contacts From Business](./ghl/contacts/add-remove-contact-from-business.md) |
| `POST` | `/contacts/bulk/tags/update/:type` | [Update Contacts Tags](./ghl/contacts/create-association.md) |
| `GET` | `/contacts/business/:businessId` | [Get Contacts By BusinessId](./ghl/contacts/get-contacts-by-business-id.md) |
| `GET` | `/contacts/lookup` | [Lookup Contact By Email Or Phone](./ghl/contacts/lookup-contact.md) |
| `POST` | `/contacts/search` | [Search Contacts](./ghl/contacts/search-contacts-advanced.md) |
| `GET` | `/contacts/search/duplicate` | [Get Duplicate Contact](./ghl/contacts/get-duplicate-contact.md) |
| `POST` | `/contacts/upsert` | [Upsert Contact](./ghl/contacts/upsert-contact.md) |

### `conversation-ai` (12 endpoints)

Páginas de contexto: [Actions](./ghl/conversation-ai/actions.md), [Agents](./ghl/conversation-ai/agents.md), [Conversation AI API](./ghl/conversation-ai/conversation-ai-api.md), [Generations](./ghl/conversation-ai/generations.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/conversation-ai/agents` | [Create an Agent](./ghl/conversation-ai/create-agent.md) |
| `DELETE` | `/conversation-ai/agents/:agentId` | [Delete Agent](./ghl/conversation-ai/delete-agent.md) |
| `GET` | `/conversation-ai/agents/:agentId` | [Get Agent](./ghl/conversation-ai/get-agent.md) |
| `PUT` | `/conversation-ai/agents/:agentId` | [Update Agent](./ghl/conversation-ai/update-agent.md) |
| `POST` | `/conversation-ai/agents/:agentId/actions` | [Attach Action to Agent](./ghl/conversation-ai/create-action.md) |
| `DELETE` | `/conversation-ai/agents/:agentId/actions/:actionId` | [Remove Action from Agent](./ghl/conversation-ai/delete-action.md) |
| `GET` | `/conversation-ai/agents/:agentId/actions/:actionId` | [Get Action by ID](./ghl/conversation-ai/get-action-by-id.md) |
| `PUT` | `/conversation-ai/agents/:agentId/actions/:actionId` | [Update Action](./ghl/conversation-ai/update-action.md) |
| `GET` | `/conversation-ai/agents/:agentId/actions/list` | [List Actions for an Agent](./ghl/conversation-ai/list-actions.md) |
| `PATCH` | `/conversation-ai/agents/:agentId/followup-settings` | [Update Followup Settings](./ghl/conversation-ai/update-followup-settings.md) |
| `GET` | `/conversation-ai/agents/search` | [Search Agents](./ghl/conversation-ai/search-agent.md) |
| `GET` | `/conversation-ai/generations` | [Get the generation details](./ghl/conversation-ai/get-generation-details.md) |

### `conversations` (22 endpoints)

Páginas de contexto: [Conversations API](./ghl/conversations/conversations-api.md), [Conversations](./ghl/conversations/conversations.md), [Email](./ghl/conversations/email.md), [Messages](./ghl/conversations/messages.md), [Providers](./ghl/conversations/providers.md), [Search](./ghl/conversations/search.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/conversations/` | [Create Conversation](./ghl/conversations/create-conversation.md) |
| `DELETE` | `/conversations/:conversationId` | [Delete Conversation](./ghl/conversations/delete-conversation.md) |
| `GET` | `/conversations/:conversationId` | [Get Conversation](./ghl/conversations/get-conversation.md) |
| `PUT` | `/conversations/:conversationId` | [Update Conversation](./ghl/conversations/update-conversation.md) |
| `GET` | `/conversations/:conversationId/messages` | [Get messages by conversation id](./ghl/conversations/get-messages.md) |
| `GET` | `/conversations/locations/:locationId/messages/:messageId/transcription` | [Get transcription by Message ID](./ghl/conversations/get-message-transcription.md) |
| `GET` | `/conversations/locations/:locationId/messages/:messageId/transcription/download` | [Download transcription by Message ID](./ghl/conversations/download-message-transcription.md) |
| `POST` | `/conversations/messages` | [Send a new message](./ghl/conversations/send-a-new-message.md) |
| `GET` | `/conversations/messages/:id` | [Get message by message id](./ghl/conversations/get-message.md) |
| `PUT` | `/conversations/messages/:messageId/attachments` | [Add message attachments](./ghl/conversations/add-message-attachments.md) |
| `GET` | `/conversations/messages/:messageId/locations/:locationId/recording` | [Get Recording by Message ID](./ghl/conversations/get-message-recording.md) |
| `DELETE` | `/conversations/messages/:messageId/schedule` | [Cancel a scheduled message.](./ghl/conversations/cancel-scheduled-message.md) |
| `PUT` | `/conversations/messages/:messageId/status` | [Update message status](./ghl/conversations/update-message-status.md) |
| `DELETE` | `/conversations/messages/email/:emailMessageId/schedule` | [Cancel a scheduled email message.](./ghl/conversations/cancel-scheduled-email-message.md) |
| `PUT` | `/conversations/messages/email/:emailMessageId/status` | [Update email message status](./ghl/conversations/update-email-message-status.md) |
| `GET` | `/conversations/messages/email/:id` | [Get email by Id](./ghl/conversations/get-email-by-id.md) |
| `GET` | `/conversations/messages/export` | [Export messages by location ID](./ghl/conversations/export-messages-by-location.md) |
| `POST` | `/conversations/messages/inbound` | [Add an inbound message](./ghl/conversations/add-an-inbound-message.md) |
| `POST` | `/conversations/messages/outbound` | [Add an external outbound call](./ghl/conversations/add-an-outbound-message.md) |
| `POST` | `/conversations/messages/upload` | [Upload file attachments](./ghl/conversations/upload-file-attachments.md) |
| `POST` | `/conversations/providers/live-chat/typing` | [Agent/Ai-Bot is typing a message indicator for live chat](./ghl/conversations/live-chat-agent-typing.md) |
| `GET` | `/conversations/search` | [Search Conversations](./ghl/conversations/search-conversation.md) |

### `courses` (1 endpoints)

Páginas de contexto: [MEMBERSHIPS API](./ghl/courses/memberships-api.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/courses/courses-exporter/public/import` | [Import Courses](./ghl/courses/import-courses.md) |

### `custom-fields` (8 endpoints)

Páginas de contexto: [Custom Fields V2 API](./ghl/custom-fields/custom-fields-v-2-api.md), [Custom Fields V2](./ghl/custom-fields/custom-fields-v-2.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/custom-fields/` | [Create Custom Field](./ghl/custom-fields/create-custom-field.md) |
| `DELETE` | `/custom-fields/:id` | [Delete Custom Field By Id](./ghl/custom-fields/delete-custom-field.md) |
| `GET` | `/custom-fields/:id` | [Get Custom Field / Folder By Id](./ghl/custom-fields/get-custom-field-by-id.md) |
| `PUT` | `/custom-fields/:id` | [Update Custom Field By Id](./ghl/custom-fields/update-custom-field.md) |
| `POST` | `/custom-fields/folder` | [Create Custom Field Folder](./ghl/custom-fields/create-custom-field-folder.md) |
| `DELETE` | `/custom-fields/folder/:id` | [Delete Custom Field Folder](./ghl/custom-fields/delete-custom-field-folder.md) |
| `PUT` | `/custom-fields/folder/:id` | [Update Custom Field Folder Name](./ghl/custom-fields/update-custom-field-folder.md) |
| `GET` | `/custom-fields/object-key/:objectKey` | [Get Custom Fields By Object Key](./ghl/custom-fields/get-custom-fields-by-object-key.md) |

### `custom-menus` (5 endpoints)

Páginas de contexto: [Custom Menu Links](./ghl/custom-menus/custom-menu-links.md), [Custom menus API](./ghl/custom-menus/custom-menus-api.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/custom-menus/` | [Get Custom Menu Links](./ghl/custom-menus/get-custom-menus.md) |
| `POST` | `/custom-menus/` | [Create Custom Menu Link](./ghl/custom-menus/create-custom-menu.md) |
| `DELETE` | `/custom-menus/:customMenuId` | [Delete Custom Menu Link](./ghl/custom-menus/delete-custom-menu.md) |
| `GET` | `/custom-menus/:customMenuId` | [Get Custom Menu Link](./ghl/custom-menus/get-custom-menu-by-id.md) |
| `PUT` | `/custom-menus/:customMenuId` | [Update Custom Menu Link](./ghl/custom-menus/update-custom-menu.md) |

### `email-isv` (1 endpoints)

Páginas de contexto: [Email ISV API v3](./ghl/email-isv/email-isv-api-v-3.md), [Email Verification](./ghl/email-isv/email-verification.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/email/verify` | [Email Verification](./ghl/email-isv/verify-email.md) |

### `emails` (18 endpoints)

Páginas de contexto: [Campaigns](./ghl/emails/campaigns.md), [Email API v3](./ghl/emails/email-api-v-3.md), [Statistics](./ghl/emails/statistics.md), [Templates](./ghl/emails/templates.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/emails/locations/:locationId/campaigns/bulk-actions` | [List Bulk Action Campaigns](./ghl/emails/list-bulk-action-campaigns.md) |
| `GET` | `/emails/locations/:locationId/campaigns/bulk-actions/:campaignId` | [Get Bulk Action Campaign by ID](./ghl/emails/get-bulk-action-campaign.md) |
| `GET` | `/emails/locations/:locationId/campaigns/emails` | [List Email Campaigns](./ghl/emails/list-email-campaigns.md) |
| `POST` | `/emails/locations/:locationId/campaigns/emails` | [Create Email Campaign](./ghl/emails/create-email-campaign.md) |
| `DELETE` | `/emails/locations/:locationId/campaigns/emails/:campaignId` | [Delete Campaign](./ghl/emails/delete-campaign.md) |
| `GET` | `/emails/locations/:locationId/campaigns/emails/:campaignId` | [Get Email Campaign by ID](./ghl/emails/get-email-campaign.md) |
| `PATCH` | `/emails/locations/:locationId/campaigns/emails/:campaignId` | [Update Email Campaign](./ghl/emails/update-email-campaign.md) |
| `POST` | `/emails/locations/:locationId/campaigns/emails/:campaignId/schedule` | [Schedule Campaign](./ghl/emails/schedule-campaign.md) |
| `GET` | `/emails/locations/:locationId/campaigns/stats/:source/:sourceId` | [Get Campaign Statistics](./ghl/emails/get-campaign-stats.md) |
| `GET` | `/emails/locations/:locationId/campaigns/workflows` | [List Workflow Campaigns](./ghl/emails/list-workflow-campaigns.md) |
| `GET` | `/emails/locations/:locationId/campaigns/workflows/:campaignId` | [Get Workflow Campaign by ID](./ghl/emails/get-workflow-campaign.md) |
| `GET` | `/emails/locations/:locationId/templates` | [List templates](./ghl/emails/list-email-templates.md) |
| `POST` | `/emails/locations/:locationId/templates` | [Create an email template](./ghl/emails/create-email-template.md) |
| `DELETE` | `/emails/locations/:locationId/templates/:templateId` | [Delete a template](./ghl/emails/delete-email-template.md) |
| `GET` | `/emails/locations/:locationId/templates/:templateId` | [Get Email Template by ID](./ghl/emails/get-email-template.md) |
| `PATCH` | `/emails/locations/:locationId/templates/:templateId` | [Update an email template](./ghl/emails/update-email-template.md) |
| `POST` | `/emails/locations/:locationId/templates/folders` | [Create a template folder](./ghl/emails/create-template-folder.md) |
| `POST` | `/emails/locations/:locationId/templates/import` | [Import an email template](./ghl/emails/import-email-template.md) |

### `files` (1 endpoints)

Páginas de contexto: [Files API](./ghl/files/files-api.md), [Files](./ghl/files/files.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/files/d/:slug` | [Get File](./ghl/files/get-file-by-slug.md) |

### `forms` (3 endpoints)

Páginas de contexto: [Forms API](./ghl/forms/forms-api.md), [Forms](./ghl/forms/forms.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/forms/` | [Get Forms](./ghl/forms/get-forms.md) |
| `GET` | `/forms/submissions` | [Get Forms Submissions](./ghl/forms/get-forms-submissions.md) |
| `POST` | `/forms/upload-custom-files` | [Upload files to custom fields](./ghl/forms/upload-to-custom-fields.md) |

### `funnels` (7 endpoints)

Páginas de contexto: [Funnel](./ghl/funnels/funnel.md), [Funnels API](./ghl/funnels/funnels-api.md), [Redirect](./ghl/funnels/redirect.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/funnels/funnel/list` | [Fetch List of Funnels](./ghl/funnels/get-funnels.md) |
| `POST` | `/funnels/lookup/redirect` | [Create Redirect](./ghl/funnels/create-redirect.md) |
| `DELETE` | `/funnels/lookup/redirect/:id` | [Delete Redirect By Id](./ghl/funnels/delete-redirect-by-id.md) |
| `PATCH` | `/funnels/lookup/redirect/:id` | [Update Redirect By Id](./ghl/funnels/update-redirect-by-id.md) |
| `GET` | `/funnels/lookup/redirect/list` | [Fetch List of Redirects](./ghl/funnels/fetch-redirects-list.md) |
| `GET` | `/funnels/page` | [Fetch list of funnel pages](./ghl/funnels/get-pages-by-funnel-id.md) |
| `GET` | `/funnels/page/count` | [Fetch count of funnel pages](./ghl/funnels/get-pages-count-by-funnel-id.md) |

### `invoices` (42 endpoints)

Páginas de contexto: [Estimate](./ghl/invoices/estimate.md), [Invoice API](./ghl/invoices/invoice-api.md), [Invoice](./ghl/invoices/invoice.md), [Schedule](./ghl/invoices/schedule.md), [Template](./ghl/invoices/template.md), [Text2Pay](./ghl/invoices/text-2-pay.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/invoices/` | [List invoices](./ghl/invoices/list-invoices.md) |
| `POST` | `/invoices/` | [Create Invoice](./ghl/invoices/create-invoice.md) |
| `DELETE` | `/invoices/:invoiceId` | [Delete invoice](./ghl/invoices/delete-invoice.md) |
| `GET` | `/invoices/:invoiceId` | [Get invoice](./ghl/invoices/get-invoice.md) |
| `PUT` | `/invoices/:invoiceId` | [Update invoice](./ghl/invoices/update-invoice.md) |
| `PATCH` | `/invoices/:invoiceId/late-fees-configuration` | [Update invoice late fees configuration](./ghl/invoices/update-invoice-late-fees-configuration.md) |
| `POST` | `/invoices/:invoiceId/record-payment` | [Record a manual payment for an invoice](./ghl/invoices/record-invoice.md) |
| `POST` | `/invoices/:invoiceId/send` | [Send invoice](./ghl/invoices/send-invoice.md) |
| `POST` | `/invoices/:invoiceId/void` | [Void invoice](./ghl/invoices/void-invoice.md) |
| `POST` | `/invoices/estimate` | [Create New Estimate](./ghl/invoices/create-new-estimate.md) |
| `DELETE` | `/invoices/estimate/:estimateId` | [Delete Estimate](./ghl/invoices/delete-estimate.md) |
| `PUT` | `/invoices/estimate/:estimateId` | [Update Estimate](./ghl/invoices/update-estimate.md) |
| `POST` | `/invoices/estimate/:estimateId/invoice` | [Create Invoice from Estimate](./ghl/invoices/create-invoice-from-estimate.md) |
| `POST` | `/invoices/estimate/:estimateId/send` | [Send Estimate](./ghl/invoices/send-estimate.md) |
| `GET` | `/invoices/estimate/list` | [List Estimates](./ghl/invoices/list-estimates.md) |
| `GET` | `/invoices/estimate/number/generate` | [Generate Estimate Number](./ghl/invoices/generate-estimate-number.md) |
| `PATCH` | `/invoices/estimate/stats/last-visited-at` | [Update estimate last visited at](./ghl/invoices/update-estimate-last-visited-at.md) |
| `GET` | `/invoices/estimate/template` | [List Estimate Templates](./ghl/invoices/list-estimate-templates.md) |
| `POST` | `/invoices/estimate/template` | [Create Estimate Template](./ghl/invoices/create-estimate-template.md) |
| `DELETE` | `/invoices/estimate/template/:templateId` | [Delete Estimate Template](./ghl/invoices/delete-estimate-template.md) |
| `PUT` | `/invoices/estimate/template/:templateId` | [Update Estimate Template](./ghl/invoices/update-estimate-template.md) |
| `GET` | `/invoices/estimate/template/preview` | [Preview Estimate Template](./ghl/invoices/preview-estimate-template.md) |
| `GET` | `/invoices/generate-invoice-number` | [Generate Invoice Number](./ghl/invoices/generate-invoice-number.md) |
| `GET` | `/invoices/schedule` | [List schedules](./ghl/invoices/list-invoice-schedules.md) |
| `POST` | `/invoices/schedule` | [Create Invoice Schedule](./ghl/invoices/create-invoice-schedule.md) |
| `DELETE` | `/invoices/schedule/:scheduleId` | [Delete schedule](./ghl/invoices/delete-invoice-schedule.md) |
| `GET` | `/invoices/schedule/:scheduleId` | [Get an schedule](./ghl/invoices/get-invoice-schedule.md) |
| `PUT` | `/invoices/schedule/:scheduleId` | [Update schedule](./ghl/invoices/update-invoice-schedule.md) |
| `POST` | `/invoices/schedule/:scheduleId/auto-payment` | [Manage Auto payment for an schedule invoice](./ghl/invoices/auto-payment-invoice-schedule.md) |
| `POST` | `/invoices/schedule/:scheduleId/cancel` | [Cancel an scheduled invoice](./ghl/invoices/cancel-invoice-schedule.md) |
| `POST` | `/invoices/schedule/:scheduleId/schedule` | [Schedule an schedule invoice](./ghl/invoices/schedule-invoice-schedule.md) |
| `POST` | `/invoices/schedule/:scheduleId/updateAndSchedule` | [Update scheduled recurring invoice](./ghl/invoices/update-and-schedule-invoice-schedule.md) |
| `GET` | `/invoices/settings` | [Get Invoice Settings](./ghl/invoices/get-invoice-settings.md) |
| `PATCH` | `/invoices/stats/last-visited-at` | [Update invoice last visited at](./ghl/invoices/update-invoice-last-visited-at.md) |
| `GET` | `/invoices/template` | [List templates](./ghl/invoices/list-invoice-templates.md) |
| `POST` | `/invoices/template` | [Create template](./ghl/invoices/create-invoice-template.md) |
| `DELETE` | `/invoices/template/:templateId` | [Delete template](./ghl/invoices/delete-invoice-template.md) |
| `GET` | `/invoices/template/:templateId` | [Get an template](./ghl/invoices/get-invoice-template.md) |
| `PUT` | `/invoices/template/:templateId` | [Update template](./ghl/invoices/update-invoice-template.md) |
| `PATCH` | `/invoices/template/:templateId/late-fees-configuration` | [Update template late fees configuration](./ghl/invoices/update-invoice-template-late-fees-configuration.md) |
| `PATCH` | `/invoices/template/:templateId/payment-methods-configuration` | [Update template late fees configuration](./ghl/invoices/update-invoice-payment-methods-configuration.md) |
| `POST` | `/invoices/text2pay` | [Create & Send](./ghl/invoices/text-2-pay-invoice.md) |

### `knowledge-base` (19 endpoints)

Páginas de contexto: [Faqs](./ghl/knowledge-base/faqs.md), [Files](./ghl/knowledge-base/files.md), [Knowledge Base API](./ghl/knowledge-base/knowledge-base-api.md), [Knowledge Base](./ghl/knowledge-base/knowledge-base.md), [Web Crawler](./ghl/knowledge-base/web-crawler.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/knowledge-bases/` | [Get all knowledge bases for a location by location Id (paginated)](./ghl/knowledge-base/list-all-knowledge-bases-paginated.md) |
| `POST` | `/knowledge-bases/` | [Create a new knowledge base (max 15 knowledge bases per location)](./ghl/knowledge-base/create-knowledge-base.md) |
| `PUT` | `/knowledge-bases/:id` | [Update a knowledge base](./ghl/knowledge-base/update-knowledge-base.md) |
| `DELETE` | `/knowledge-bases/:knowledgeBaseId` | [Delete a knowledge base](./ghl/knowledge-base/delete-knowledge-base.md) |
| `GET` | `/knowledge-bases/:knowledgeBaseId` | [Get knowledge base by ID](./ghl/knowledge-base/get-knowledge-base-by-id.md) |
| `DELETE` | `/knowledge-bases/crawler` | [Delete trained pages](./ghl/knowledge-base/delete-trained-urls-for-knowledge-base.md) |
| `GET` | `/knowledge-bases/crawler` | [Get all trained page links by knowledge base](./ghl/knowledge-base/get-all-website-urls-data-by-knowledge-base.md) |
| `POST` | `/knowledge-bases/crawler` | [Start crawling and discover pages for training](./ghl/knowledge-base/discover-website.md) |
| `POST` | `/knowledge-bases/crawler/sitemap-preview` | [Preview Sitemap URLs](./ghl/knowledge-base/get-sitemap-preview.md) |
| `GET` | `/knowledge-bases/crawler/status` | [Get crawling status for the latest operation](./ghl/knowledge-base/get-crawling-status-for-latest-operation.md) |
| `POST` | `/knowledge-bases/crawler/train` | [Train discovered website pages and ingest into the knowledge base](./ghl/knowledge-base/train-discovered-urls.md) |
| `GET` | `/knowledge-bases/faqs` | [Get all FAQs by knowledge base with pagination support](./ghl/knowledge-base/list.md) |
| `POST` | `/knowledge-bases/faqs` | [Create a new FAQ inside knowledge base](./ghl/knowledge-base/create.md) |
| `DELETE` | `/knowledge-bases/faqs/:id` | [Delete an existing knowledge base FAQ](./ghl/knowledge-base/delete.md) |
| `PUT` | `/knowledge-bases/faqs/:id` | [Update an existing knowledge base FAQ](./ghl/knowledge-base/update.md) |
| `GET` | `/knowledge-bases/files` | [Get all files by knowledge base](./ghl/knowledge-base/get-files-by-knowledge-base-public.md) |
| `POST` | `/knowledge-bases/files` | [Uploads a file to knowledge base (max file size: 10MB)](./ghl/knowledge-base/upload-file.md) |
| `DELETE` | `/knowledge-bases/files/:fileId` | [Delete a file from knowledge base](./ghl/knowledge-base/delete-file.md) |
| `GET` | `/knowledge-bases/files/:fileId` | [Get file by id](./ghl/knowledge-base/get-file-by-id.md) |

### `links` (6 endpoints)

Páginas de contexto: [Trigger Links API](./ghl/links/trigger-links-api.md), [Trigger Links Search](./ghl/links/trigger-links-search.md), [Trigger Links](./ghl/links/trigger-links.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/links/` | [Get Links](./ghl/links/get-links.md) |
| `POST` | `/links/` | [Create Link](./ghl/links/create-link.md) |
| `DELETE` | `/links/:linkId` | [Delete Link](./ghl/links/delete-link.md) |
| `PUT` | `/links/:linkId` | [Update Link](./ghl/links/update-link.md) |
| `GET` | `/links/id/:linkId` | [Get Link by ID](./ghl/links/get-link-by-id.md) |
| `GET` | `/links/search` | [Search Trigger Links](./ghl/links/search-trigger-links.md) |

### `locations` (32 endpoints)

Páginas de contexto: [Conversation Channel](./ghl/locations/conversation-channel.md), [Custom Field](./ghl/locations/custom-field.md), [Custom Value](./ghl/locations/custom-value.md), [Permissions](./ghl/locations/permissions.md), [Recurring Tasks](./ghl/locations/recurring-tasks.md), [Search](./ghl/locations/search.md), [Sub-Account (Formerly location) API](./ghl/locations/sub-account-formerly-location-api.md), [Sub-Account (Formerly Location)](./ghl/locations/sub-account-formerly-location.md), [Tags](./ghl/locations/tags.md), [Tasks Search](./ghl/locations/tasks-search.md), [Template](./ghl/locations/template.md), [Timezone](./ghl/locations/timezone.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/locations/` | [Create Sub-Account (Formerly Location)](./ghl/locations/create-location.md) |
| `DELETE` | `/locations/:locationId` | [Delete Sub-Account (Formerly Location)](./ghl/locations/delete-location.md) |
| `GET` | `/locations/:locationId` | [Get Sub-Account (Formerly Location)](./ghl/locations/get-location.md) |
| `PUT` | `/locations/:locationId` | [Put Sub-Account (Formerly Location)](./ghl/locations/put-location.md) |
| `GET` | `/locations/:locationId/conversationChannels/:type` | [Get Conversation Channel](./ghl/locations/get-conversation-channel.md) |
| `GET` | `/locations/:locationId/customFields` | [Get Custom Fields](./ghl/locations/get-custom-fields.md) |
| `POST` | `/locations/:locationId/customFields` | [Create Custom Field](./ghl/locations/create-custom-field.md) |
| `DELETE` | `/locations/:locationId/customFields/:id` | [Delete Custom Field](./ghl/locations/delete-custom-field.md) |
| `GET` | `/locations/:locationId/customFields/:id` | [Get Custom Field](./ghl/locations/get-custom-field.md) |
| `PUT` | `/locations/:locationId/customFields/:id` | [Update Custom Field](./ghl/locations/update-custom-field.md) |
| `POST` | `/locations/:locationId/customFields/upload` | [Uploads File to customFields](./ghl/locations/upload-file-custom-fields.md) |
| `GET` | `/locations/:locationId/customValues` | [Get Custom Values](./ghl/locations/get-custom-values.md) |
| `POST` | `/locations/:locationId/customValues` | [Create Custom Value](./ghl/locations/create-custom-value.md) |
| `DELETE` | `/locations/:locationId/customValues/:id` | [Delete Custom Value](./ghl/locations/delete-custom-value.md) |
| `GET` | `/locations/:locationId/customValues/:id` | [Get Custom Value](./ghl/locations/get-custom-value.md) |
| `PUT` | `/locations/:locationId/customValues/:id` | [Update Custom Value](./ghl/locations/update-custom-value.md) |
| `GET` | `/locations/:locationId/permissions` | [Get Permissions](./ghl/locations/get-location-permissions.md) |
| `PUT` | `/locations/:locationId/permissions` | [Update Permissions](./ghl/locations/update-location-permissions.md) |
| `POST` | `/locations/:locationId/recurring-tasks` | [Create Recurring Task](./ghl/locations/create-recurring-task.md) |
| `DELETE` | `/locations/:locationId/recurring-tasks/:id` | [Delete Recurring Task](./ghl/locations/delete-recurring-task.md) |
| `GET` | `/locations/:locationId/recurring-tasks/:id` | [Get Recurring Task By Id](./ghl/locations/get-recurring-task-by-id.md) |
| `PUT` | `/locations/:locationId/recurring-tasks/:id` | [Update Recurring Task](./ghl/locations/update-recurring-task.md) |
| `GET` | `/locations/:locationId/tags` | [Get Tags](./ghl/locations/get-location-tags.md) |
| `POST` | `/locations/:locationId/tags` | [Create Tag](./ghl/locations/create-tag.md) |
| `DELETE` | `/locations/:locationId/tags/:tagId` | [Delete tag](./ghl/locations/delete-tag.md) |
| `GET` | `/locations/:locationId/tags/:tagId` | [Get tag by id](./ghl/locations/get-tag-by-id.md) |
| `PUT` | `/locations/:locationId/tags/:tagId` | [Update tag](./ghl/locations/update-tag.md) |
| `POST` | `/locations/:locationId/tasks/search` | [Task Search Filter](./ghl/locations/task-search.md) |
| `GET` | `/locations/:locationId/templates` | [GET all or email/sms templates](./ghl/locations/get-all-or-email-sms-templates.md) |
| `DELETE` | `/locations/:locationId/templates/:id` | [DELETE an email/sms template](./ghl/locations/delete-an-email-sms-template.md) |
| `GET` | `/locations/:locationId/timezones` | [Fetch Timezones](./ghl/locations/get-timezones.md) |
| `GET` | `/locations/search` | [Search](./ghl/locations/search-locations.md) |

### `marketplace` (9 endpoints)

Páginas de contexto: [App Billing Management](./ghl/marketplace/app-billing-management.md), [App Management](./ghl/marketplace/app-management.md), [Developer marketplace API](./ghl/marketplace/developer-marketplace-api.md), [External Auth Migration](./ghl/marketplace/external-auth-migration.md), [Wallet Charges](./ghl/marketplace/wallet-charges.md)

| Método | Path | Página |
| --- | --- | --- |
| `DELETE` | `/marketplace/app/:appId/installations` | [Uninstall an application](./ghl/marketplace/uninstall-application.md) |
| `GET` | `/marketplace/app/:appId/installations` | [Get Installer Details](./ghl/marketplace/get-installer-details.md) |
| `GET` | `/marketplace/app/:appId/rebilling-config/location/:locationId` | [Get rebilling config for an app subscription and usage plans](./ghl/marketplace/get-rebilling-config-for-app.md) |
| `GET` | `/marketplace/billing/charges` | [Get all wallet charges](./ghl/marketplace/get-charges.md) |
| `POST` | `/marketplace/billing/charges` | [Create a new wallet charge](./ghl/marketplace/charge.md) |
| `DELETE` | `/marketplace/billing/charges/:chargeId` | [Delete a wallet charge](./ghl/marketplace/delete-charge.md) |
| `GET` | `/marketplace/billing/charges/:chargeId` | [Get specific wallet charge details](./ghl/marketplace/get-specific-charge.md) |
| `GET` | `/marketplace/billing/charges/has-funds` | [Check if account has sufficient funds](./ghl/marketplace/has-funds.md) |
| `POST` | `/marketplace/external-auth/migration` | [Migrate external authentication connection](./ghl/marketplace/migrate-connection.md) |

### `medias` (7 endpoints)

Páginas de contexto: [Media Files/Folders](./ghl/medias/media-files-folders.md), [Media Storage API](./ghl/medias/media-storage-api.md)

| Método | Path | Página |
| --- | --- | --- |
| `DELETE` | `/medias/:id` | [Delete File or Folder](./ghl/medias/delete-media-content.md) |
| `POST` | `/medias/:id` | [Update File/Folder](./ghl/medias/update-media-object.md) |
| `PUT` | `/medias/delete-files` | [Bulk Delete / Trash Files/Folders](./ghl/medias/bulk-delete-media-objects.md) |
| `GET` | `/medias/files` | [Get List of Files/Folders](./ghl/medias/fetch-media-content.md) |
| `POST` | `/medias/folder` | [Create Folder](./ghl/medias/create-media-folder.md) |
| `PUT` | `/medias/update-files` | [Bulk Update Files/Folders](./ghl/medias/bulk-update-media-objects.md) |
| `POST` | `/medias/upload-file` | [Upload File into Media Storage](./ghl/medias/upload-media-content.md) |

### `oauth` (3 endpoints)

Páginas de contexto: [OAuth 2.0](./ghl/oauth/o-auth-2-0.md), [OAuth 2.0 v3](./ghl/oauth/oauth-2-0-v-3.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/oauth/installed-locations` | [Get Location where app is installed](./ghl/oauth/get-installed-location.md) |
| `POST` | `/oauth/location-token` | [Get Location Access Token from Agency Token](./ghl/oauth/get-location-access-token.md) |
| `POST` | `/oauth/token` | [Get Access Token](./ghl/oauth/get-access-token.md) |

### `objects` (9 endpoints)

Páginas de contexto: [CUSTOM_OBJECTS API](./ghl/objects/custom-objects-api.md), [Object Schema](./ghl/objects/object-schema.md), [Records](./ghl/objects/records.md), [Search Object Records](./ghl/objects/search-object-records-tag.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/objects/` | [Get all objects for a location](./ghl/objects/get-object-by-location-id.md) |
| `POST` | `/objects/` | [Create Custom Object](./ghl/objects/create-custom-object-schema.md) |
| `GET` | `/objects/:key` | [Get Object Schema by key / id](./ghl/objects/get-object-schema-by-key.md) |
| `PUT` | `/objects/:key` | [Update Object Schema By Key / Id](./ghl/objects/update-custom-object.md) |
| `POST` | `/objects/:schemaKey/records` | [Create Record](./ghl/objects/create-object-record.md) |
| `DELETE` | `/objects/:schemaKey/records/:id` | [Delete Record](./ghl/objects/delete-object-record.md) |
| `GET` | `/objects/:schemaKey/records/:id` | [Get Record By Id](./ghl/objects/get-record-by-id.md) |
| `PUT` | `/objects/:schemaKey/records/:id` | [Update Record](./ghl/objects/update-object-record.md) |
| `POST` | `/objects/:schemaKey/records/search` | [Search Object Records](./ghl/objects/search-object-records.md) |

### `opportunities` (16 endpoints)

Páginas de contexto: [Followers](./ghl/opportunities/followers.md), [Lost reason](./ghl/opportunities/lost-reason.md), [Opportunities API v3](./ghl/opportunities/opportunities-api-v-3.md), [Opportunities](./ghl/opportunities/opportunities.md), [Pipelines](./ghl/opportunities/pipelines.md), [Search](./ghl/opportunities/search.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/opportunities/` | [Create Opportunity](./ghl/opportunities/create-opportunity.md) |
| `DELETE` | `/opportunities/:id` | [Delete Opportunity](./ghl/opportunities/delete-opportunity.md) |
| `GET` | `/opportunities/:id` | [Get Opportunity](./ghl/opportunities/get-opportunity.md) |
| `PUT` | `/opportunities/:id` | [Update Opportunity](./ghl/opportunities/update-opportunity.md) |
| `DELETE` | `/opportunities/:id/followers` | [Remove Followers](./ghl/opportunities/remove-followers-opportunity.md) |
| `POST` | `/opportunities/:id/followers` | [Add Followers](./ghl/opportunities/add-followers-opportunity.md) |
| `PUT` | `/opportunities/:id/status` | [Update Opportunity Status](./ghl/opportunities/update-opportunity-status.md) |
| `GET` | `/opportunities/lost-reason` | [Get lost reason](./ghl/opportunities/get-lost-reason.md) |
| `GET` | `/opportunities/pipelines` | [Get Pipelines](./ghl/opportunities/get-pipelines.md) |
| `POST` | `/opportunities/pipelines` | [Create Pipeline](./ghl/opportunities/create-pipeline.md) |
| `DELETE` | `/opportunities/pipelines/:pipelineId` | [Delete Pipeline](./ghl/opportunities/delete-pipeline.md) |
| `GET` | `/opportunities/pipelines/:pipelineId` | [Get Pipeline](./ghl/opportunities/get-pipeline.md) |
| `PUT` | `/opportunities/pipelines/:pipelineId` | [Update Pipeline](./ghl/opportunities/update-pipeline.md) |
| `GET` | `/opportunities/search` | [Search Opportunity](./ghl/opportunities/search-opportunity.md) |
| `POST` | `/opportunities/search` | [Search Opportunities](./ghl/opportunities/search-opportunities-advanced.md) |
| `POST` | `/opportunities/upsert` | [Upsert Opportunity](./ghl/opportunities/upsert-opportunity.md) |

### `payments` (23 endpoints)

Páginas de contexto: [Coupons](./ghl/payments/coupons.md), [Custom Provider](./ghl/payments/custom-provider.md), [Integrations](./ghl/payments/integrations.md), [Order fulfillments](./ghl/payments/order-fulfillments.md), [Order Notes](./ghl/payments/order-notes.md), [Orders](./ghl/payments/orders.md), [Payments API](./ghl/payments/payments-api.md), [Subscriptions](./ghl/payments/subscriptions.md), [Transactions](./ghl/payments/transactions.md)

| Método | Path | Página |
| --- | --- | --- |
| `DELETE` | `/payments/coupon` | [Delete Coupon](./ghl/payments/delete-coupon.md) |
| `GET` | `/payments/coupon` | [Fetch Coupon](./ghl/payments/get-coupon.md) |
| `POST` | `/payments/coupon` | [Create Coupon](./ghl/payments/create-coupon.md) |
| `PUT` | `/payments/coupon` | [Update Coupon](./ghl/payments/update-coupon.md) |
| `GET` | `/payments/coupon/list` | [List Coupons](./ghl/payments/list-coupons.md) |
| `PUT` | `/payments/custom-provider/capabilities` | [Custom-provider marketplace app update capabilities](./ghl/payments/custom-provider-marketplace-app-update-capabilities.md) |
| `GET` | `/payments/custom-provider/connect` | [Fetch given provider config](./ghl/payments/fetch-config.md) |
| `POST` | `/payments/custom-provider/connect` | [Create new provider config](./ghl/payments/create-config.md) |
| `POST` | `/payments/custom-provider/disconnect` | [Disconnect existing provider config](./ghl/payments/disconnect-config.md) |
| `DELETE` | `/payments/custom-provider/provider` | [Deleting an existing integration](./ghl/payments/delete-integration.md) |
| `POST` | `/payments/custom-provider/provider` | [Create new integration](./ghl/payments/create-integration.md) |
| `GET` | `/payments/integrations/provider/whitelabel` | [List White-label Integration Providers](./ghl/payments/list-integration-providers.md) |
| `POST` | `/payments/integrations/provider/whitelabel` | [Create White-label Integration Provider](./ghl/payments/create-integration-provider.md) |
| `GET` | `/payments/orders` | [List Orders](./ghl/payments/list-orders.md) |
| `GET` | `/payments/orders/:orderId` | [Get Order by ID](./ghl/payments/get-order-by-id.md) |
| `GET` | `/payments/orders/:orderId/fulfillments` | [List fulfillment](./ghl/payments/list-order-fulfillment.md) |
| `POST` | `/payments/orders/:orderId/fulfillments` | [Create order fulfillment](./ghl/payments/create-order-fulfillment.md) |
| `GET` | `/payments/orders/:orderId/notes` | [List Order Notes](./ghl/payments/list-order-notes.md) |
| `POST` | `/payments/orders/:orderId/record-payment` | [Record Order Payment](./ghl/payments/record-order-payment.md) |
| `GET` | `/payments/subscriptions` | [List Subscriptions](./ghl/payments/list-subscriptions.md) |
| `GET` | `/payments/subscriptions/:subscriptionId` | [Get Subscription by ID](./ghl/payments/get-subscription-by-id.md) |
| `GET` | `/payments/transactions` | [List Transactions](./ghl/payments/list-transactions.md) |
| `GET` | `/payments/transactions/:transactionId` | [Get Transaction by ID](./ghl/payments/get-transaction-by-id.md) |

### `phone-system` (4 endpoints)

Páginas de contexto: [LC Phone API v3](./ghl/phone-system/lc-phone-api-v-3.md), [lc-phone](./ghl/phone-system/lc-phone.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/phone-system/number-pools` | [List number pools](./ghl/phone-system/get-number-pool-list.md) |
| `GET` | `/phone-system/numbers/location/:locationId` | [List active numbers](./ghl/phone-system/active-numbers.md) |
| `GET` | `/phone-system/numbers/location/:locationId/available` | [List available phone numbers](./ghl/phone-system/list-available-numbers-for-a-country.md) |
| `POST` | `/phone-system/numbers/location/:locationId/purchase` | [Purchase number for location](./ghl/phone-system/purchase-number-for-location.md) |

### `products` (27 endpoints)

Páginas de contexto: [Collections](./ghl/products/collections.md), [Prices](./ghl/products/prices.md), [Products API](./ghl/products/products-api.md), [Products](./ghl/products/products.md), [Reviews](./ghl/products/reviews.md), [Store](./ghl/products/store.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/products/` | [List Products](./ghl/products/list-invoices.md) |
| `POST` | `/products/` | [Create Product](./ghl/products/create-product.md) |
| `DELETE` | `/products/:productId` | [Delete Product by ID](./ghl/products/delete-product-by-id.md) |
| `GET` | `/products/:productId` | [Get Product by ID](./ghl/products/get-product-by-id.md) |
| `PUT` | `/products/:productId` | [Update Product by ID](./ghl/products/update-product-by-id.md) |
| `GET` | `/products/:productId/price` | [List Prices for a Product](./ghl/products/list-prices-for-product.md) |
| `POST` | `/products/:productId/price` | [Create Price for a Product](./ghl/products/create-price-for-product.md) |
| `DELETE` | `/products/:productId/price/:priceId` | [Delete Price by ID for a Product](./ghl/products/delete-price-by-id-for-product.md) |
| `GET` | `/products/:productId/price/:priceId` | [Get Price by ID for a Product](./ghl/products/get-price-by-id-for-product.md) |
| `PUT` | `/products/:productId/price/:priceId` | [Update Price by ID for a Product](./ghl/products/update-price-by-id-for-product.md) |
| `POST` | `/products/bulk-update` | [Bulk Update Products](./ghl/products/bulk-update.md) |
| `POST` | `/products/bulk-update/edit` | [Bulk Edit Products and Prices](./ghl/products/bulk-edit.md) |
| `GET` | `/products/collections` | [Fetch Product Collections](./ghl/products/get-product-collection.md) |
| `POST` | `/products/collections` | [Create Product Collection](./ghl/products/create-product-collection.md) |
| `DELETE` | `/products/collections/:collectionId` | [Delete Product Collection](./ghl/products/delete-product-collection.md) |
| `GET` | `/products/collections/:collectionId` | [Get Details about individual product collection](./ghl/products/get-product-collection-id.md) |
| `PUT` | `/products/collections/:collectionId` | [Update Product Collection](./ghl/products/update-product-collection.md) |
| `GET` | `/products/inventory` | [List Inventory](./ghl/products/get-list-inventory.md) |
| `POST` | `/products/inventory` | [Update Inventory](./ghl/products/update-inventory.md) |
| `GET` | `/products/reviews` | [Fetch Product Reviews](./ghl/products/get-product-reviews.md) |
| `DELETE` | `/products/reviews/:reviewId` | [Delete Product Review](./ghl/products/delete-product-review.md) |
| `PUT` | `/products/reviews/:reviewId` | [Update Product Reviews](./ghl/products/update-product-review.md) |
| `POST` | `/products/reviews/bulk-update` | [Update Product Reviews](./ghl/products/bulk-update-product-review.md) |
| `GET` | `/products/reviews/count` | [Fetch Review Count as per status](./ghl/products/get-reviews-count.md) |
| `POST` | `/products/store/:storeId` | [Action to include/exclude the product in store](./ghl/products/update-store-status.md) |
| `POST` | `/products/store/:storeId/priority` | [Update product display priorities in store](./ghl/products/update-display-priority.md) |
| `GET` | `/products/store/:storeId/stats` | [Fetch Product Store Stats](./ghl/products/get-product-store-stats.md) |

### `proposals` (4 endpoints)

Páginas de contexto: [Documents and Contracts API](./ghl/proposals/documents-and-contracts-api.md), [Documents](./ghl/proposals/documents.md), [Templates](./ghl/proposals/templates.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/proposals/document` | [List documents](./ghl/proposals/list-documents-contracts.md) |
| `POST` | `/proposals/document/send` | [Send document](./ghl/proposals/send-documents-contracts.md) |
| `GET` | `/proposals/templates` | [List templates](./ghl/proposals/list-documents-contracts-templates.md) |
| `POST` | `/proposals/templates/send` | [Send template](./ghl/proposals/send-documents-contracts-template.md) |

### `saas-api` (17 endpoints)

Páginas de contexto: [SaaS](./ghl/saas-api/saa-s.md), [SaaS API](./ghl/saas-api/saas-api.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/saas/agency-plans/:companyId` | [Get Agency Plans](./ghl/saas-api/get-agency-plans.md) |
| `POST` | `/saas/allow-attach-rebilling/:locationId` | [Allow Attach Rebilling](./ghl/saas-api/allow-attach-rebilling.md) |
| `POST` | `/saas/bulk-disable-saas/:companyId` | [Disable SaaS for locations](./ghl/saas-api/bulk-disable-saas.md) |
| `POST` | `/saas/bulk-enable-saas/:companyId` | [Bulk Enable SaaS](./ghl/saas-api/bulk-enable-saas.md) |
| `GET` | `/saas/companies/:companyId/locations/:locationId/wallet-balance` | [Get Location Wallet Balance](./ghl/saas-api/get-location-wallet-balance.md) |
| `POST` | `/saas/companies/:companyId/locations/:locationId/wallet-balance/complimentary-credits` | [Update Location Wallet Balance](./ghl/saas-api/update-location-wallet-balance.md) |
| `POST` | `/saas/companies/:companyId/wallet-transactions` | [List agency wallet transactions](./ghl/saas-api/list-agency-wallet-transactions.md) |
| `POST` | `/saas/enable-saas/:locationId` | [Enable SaaS for Sub-Account (Formerly Location)](./ghl/saas-api/enable-saas-location.md) |
| `GET` | `/saas/get-saas-subscription/:locationId` | [Get Location Subscription Details](./ghl/saas-api/get-location-subscription.md) |
| `GET` | `/saas/locations` | [Get locations by stripeId with companyId](./ghl/saas-api/locations.md) |
| `POST` | `/saas/locations/:locationId/wallet-transactions` | [List location wallet transactions](./ghl/saas-api/list-location-wallet-transactions.md) |
| `POST` | `/saas/pause/:locationId` | [Pause location](./ghl/saas-api/pause-location.md) |
| `POST` | `/saas/remove-attached-config/:locationId` | [Remove attached config](./ghl/saas-api/remove-attached-config.md) |
| `GET` | `/saas/saas-locations/:companyId` | [Get SaaS Locations](./ghl/saas-api/get-saas-locations.md) |
| `GET` | `/saas/saas-plan/:planId` | [Get SaaS Plan](./ghl/saas-api/get-saas-plan.md) |
| `POST` | `/saas/update-rebilling/:companyId` | [Update Rebilling](./ghl/saas-api/update-rebilling.md) |
| `PUT` | `/saas/update-saas-subscription/:locationId` | [Update SaaS subscription](./ghl/saas-api/generate-payment-link.md) |

### `snapshots` (4 endpoints)

Páginas de contexto: [Snapshots API](./ghl/snapshots/snapshots-api.md), [Snapshots](./ghl/snapshots/snapshots.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/snapshots/` | [Get Snapshots](./ghl/snapshots/get-custom-snapshots.md) |
| `POST` | `/snapshots/share/link` | [Create Snapshot Share Link](./ghl/snapshots/create-snapshot-share-link.md) |
| `GET` | `/snapshots/snapshot-status/:snapshotId` | [Get Snapshot Push between Dates](./ghl/snapshots/get-snapshot-push.md) |
| `GET` | `/snapshots/snapshot-status/:snapshotId/location/:locationId` | [Get Last Snapshot Push](./ghl/snapshots/get-latest-snapshot-push.md) |

### `social-planner` (51 endpoints)

Páginas de contexto: [Account](./ghl/social-planner/account.md), [Category Queue](./ghl/social-planner/category-queue.md), [Category](./ghl/social-planner/category.md), [Comments](./ghl/social-planner/comments.md), [CSV](./ghl/social-planner/csv.md), [OAuth \| Generic](./ghl/social-planner/o-auth-generic.md), [Post](./ghl/social-planner/post.md), [Social Media Posting API](./ghl/social-planner/social-media-posting-api.md), [Statistics](./ghl/social-planner/statistics.md), [Tag](./ghl/social-planner/tag.md), [Watermarks](./ghl/social-planner/watermarks.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/social-media-posting/:locationId/accounts` | [Get Accounts](./ghl/social-planner/get-account.md) |
| `DELETE` | `/social-media-posting/:locationId/accounts/:id` | [Delete Account](./ghl/social-planner/delete-account.md) |
| `GET` | `/social-media-posting/:locationId/categories` | [Get categories by location id](./ghl/social-planner/get-categories-location-id.md) |
| `GET` | `/social-media-posting/:locationId/categories/:id` | [Get categories by id](./ghl/social-planner/get-categories-id.md) |
| `GET` | `/social-media-posting/:locationId/csv` | [Get Upload Status](./ghl/social-planner/get-upload-status.md) |
| `POST` | `/social-media-posting/:locationId/csv` | [Upload CSV](./ghl/social-planner/upload-csv.md) |
| `DELETE` | `/social-media-posting/:locationId/csv/:csvId/post/:postId` | [Delete CSV Post](./ghl/social-planner/delete-csv-post.md) |
| `DELETE` | `/social-media-posting/:locationId/csv/:id` | [Delete CSV](./ghl/social-planner/delete-csv.md) |
| `GET` | `/social-media-posting/:locationId/csv/:id` | [Get CSV Post](./ghl/social-planner/get-csv-post.md) |
| `PATCH` | `/social-media-posting/:locationId/csv/:id` | [Start CSV Finalize](./ghl/social-planner/start-csv-finalize.md) |
| `POST` | `/social-media-posting/:locationId/posts` | [Create post](./ghl/social-planner/create-post.md) |
| `DELETE` | `/social-media-posting/:locationId/posts/:id` | [Delete Post](./ghl/social-planner/delete-post.md) |
| `GET` | `/social-media-posting/:locationId/posts/:id` | [Get post](./ghl/social-planner/get-post.md) |
| `PUT` | `/social-media-posting/:locationId/posts/:id` | [Edit post](./ghl/social-planner/edit-post.md) |
| `POST` | `/social-media-posting/:locationId/posts/bulk-delete` | [Bulk Delete Social Planner Posts](./ghl/social-planner/bulk-delete-social-planner-posts.md) |
| `POST` | `/social-media-posting/:locationId/posts/list` | [Get posts](./ghl/social-planner/get-posts.md) |
| `POST` | `/social-media-posting/:locationId/set-accounts` | [Set Accounts](./ghl/social-planner/set-accounts.md) |
| `GET` | `/social-media-posting/:locationId/tags` | [Get tags by location id](./ghl/social-planner/get-tags-location-id.md) |
| `POST` | `/social-media-posting/:locationId/tags/details` | [Get tags by ids](./ghl/social-planner/get-tags-by-ids.md) |
| `GET` | `/social-media-posting/:locationId/watermarks` | [List watermark templates](./ghl/social-planner/list-watermark-templates.md) |
| `POST` | `/social-media-posting/:locationId/watermarks` | [Create a watermark template](./ghl/social-planner/create-watermark-template.md) |
| `DELETE` | `/social-media-posting/:locationId/watermarks/:templateId` | [Delete a watermark template by ID](./ghl/social-planner/delete-watermark-template.md) |
| `GET` | `/social-media-posting/:locationId/watermarks/:templateId` | [Get a watermark template by ID](./ghl/social-planner/get-watermark-template.md) |
| `PUT` | `/social-media-posting/:locationId/watermarks/:templateId` | [Update a watermark template by ID](./ghl/social-planner/update-watermark-template.md) |
| `POST` | `/social-media-posting/:locationId/watermarks/add-image-watermark` | [Apply watermark to an image](./ghl/social-planner/apply-watermark-to-image.md) |
| `POST` | `/social-media-posting/category/queues` | [Create a new category queue](./ghl/social-planner/create-queue.md) |
| `DELETE` | `/social-media-posting/category/queues/:postId/active-post` | [Delete an active post and schedule the next one](./ghl/social-planner/delete-current-active-post-and-schedule-next.md) |
| `GET` | `/social-media-posting/category/queues/:queueId` | [Fetch a category queue by ID](./ghl/social-planner/fetch-queue-by-id.md) |
| `PUT` | `/social-media-posting/category/queues/:queueId` | [Update queue settings or status](./ghl/social-planner/update-queue.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/create/item` | [Create a new item in the queue](./ghl/social-planner/create-queue-item.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/edit/calendar` | [Fetch calendar view for an edit session](./ghl/social-planner/fetch-edit-session-calendar.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/edit/discard` | [Discard edit session changes](./ghl/social-planner/discard-edit-session.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/edit/save` | [Save edit session changes](./ghl/social-planner/save-edit-session.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/edit/start` | [Start or resume an edit session](./ghl/social-planner/start-edit-session.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/items` | [Fetch items from a queue](./ghl/social-planner/fetch-queue-items.md) |
| `DELETE` | `/social-media-posting/category/queues/:queueId/items/:itemId` | [Delete an item from a queue](./ghl/social-planner/delete-queue-item.md) |
| `PUT` | `/social-media-posting/category/queues/:queueId/items/:itemId` | [Update an item in a queue](./ghl/social-planner/update-queue-item.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/items/:itemId/clone` | [Clone a queue item](./ghl/social-planner/clone-queue-item.md) |
| `PUT` | `/social-media-posting/category/queues/:queueId/items/:itemId/reset` | [Reset an item in a queue](./ghl/social-planner/reset-queue-item.md) |
| `POST` | `/social-media-posting/category/queues/:queueId/slots` | [Fetch slot information for queue items](./ghl/social-planner/fetch-slots.md) |
| `GET` | `/social-media-posting/category/queues/available-categories` | [Get all categories with their queue status](./ghl/social-planner/fetch-available-categories.md) |
| `POST` | `/social-media-posting/category/queues/list` | [Fetch category queues for a location](./ghl/social-planner/fetch-queues.md) |
| `POST` | `/social-media-posting/category/queues/list/calendar` | [Get scheduled posts calendar view](./ghl/social-planner/fetch-calendar-list.md) |
| `POST` | `/social-media-posting/comments/:platform` | [Create a comment or reply](./ghl/social-planner/create-comment.md) |
| `DELETE` | `/social-media-posting/comments/:platform/:id/like` | [Unlike a comment](./ghl/social-planner/delete-like.md) |
| `POST` | `/social-media-posting/comments/:platform/:id/like` | [Like a comment](./ghl/social-planner/create-like.md) |
| `POST` | `/social-media-posting/comments/:platform/list` | [List comments for a post or thread](./ghl/social-planner/get-comment-list.md) |
| `GET` | `/social-media-posting/oauth/:locationId/:platform/accounts/:accountId` | [Get Available Accounts (Step 2 of 3)](./ghl/social-planner/get-oauth-accounts.md) |
| `POST` | `/social-media-posting/oauth/:locationId/:platform/accounts/:accountId` | [Connect Account (Step 3 of 3)](./ghl/social-planner/attach-oauth-accounts.md) |
| `GET` | `/social-media-posting/oauth/:platform/start` | [Start OAuth Flow (Step 1 of 3)](./ghl/social-planner/start-oauth.md) |
| `POST` | `/social-media-posting/statistics` | [Get Social Media Statistics](./ghl/social-planner/get-statistics.md) |

### `store` (18 endpoints)

Páginas de contexto: [Shipping Carrier](./ghl/store/shipping-carrier.md), [Shipping Zone Rates](./ghl/store/shipping-zone-rates.md), [Shipping Zone](./ghl/store/shipping-zone.md), [Store API](./ghl/store/store-api.md), [Store Setting](./ghl/store/store-setting.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/store/shipping-carrier` | [List Shipping Carriers](./ghl/store/list-shipping-carriers.md) |
| `POST` | `/store/shipping-carrier` | [Create Shipping Carrier](./ghl/store/create-shipping-carrier.md) |
| `DELETE` | `/store/shipping-carrier/:shippingCarrierId` | [Delete shipping carrier](./ghl/store/delete-shipping-carrier.md) |
| `GET` | `/store/shipping-carrier/:shippingCarrierId` | [Get Shipping Carrier](./ghl/store/get-shipping-carriers.md) |
| `PUT` | `/store/shipping-carrier/:shippingCarrierId` | [Update Shipping Carrier](./ghl/store/update-shipping-carrier.md) |
| `GET` | `/store/shipping-zone` | [List Shipping Zones](./ghl/store/list-shipping-zones.md) |
| `POST` | `/store/shipping-zone` | [Create Shipping Zone](./ghl/store/create-shipping-zone.md) |
| `DELETE` | `/store/shipping-zone/:shippingZoneId` | [Delete shipping zone](./ghl/store/delete-shipping-zone.md) |
| `GET` | `/store/shipping-zone/:shippingZoneId` | [Get Shipping Zone](./ghl/store/get-shipping-zones.md) |
| `PUT` | `/store/shipping-zone/:shippingZoneId` | [Update Shipping Zone](./ghl/store/update-shipping-zone.md) |
| `GET` | `/store/shipping-zone/:shippingZoneId/shipping-rate` | [List Shipping Rates](./ghl/store/list-shipping-rates.md) |
| `POST` | `/store/shipping-zone/:shippingZoneId/shipping-rate` | [Create Shipping Rate](./ghl/store/create-shipping-rate.md) |
| `DELETE` | `/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId` | [Delete shipping rate](./ghl/store/delete-shipping-rate.md) |
| `GET` | `/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId` | [Get Shipping Rate](./ghl/store/get-shipping-rates.md) |
| `PUT` | `/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId` | [Update Shipping Rate](./ghl/store/update-shipping-rate.md) |
| `POST` | `/store/shipping-zone/shipping-rates` | [Get available shipping rates](./ghl/store/get-available-shipping-zones.md) |
| `GET` | `/store/store-setting` | [Get Store Settings](./ghl/store/get-store-settings.md) |
| `POST` | `/store/store-setting` | [Create/Update Store Settings](./ghl/store/create-store-setting.md) |

### `surveys` (2 endpoints)

Páginas de contexto: [Surveys API](./ghl/surveys/surveys-api.md), [Surveys](./ghl/surveys/surveys.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/surveys/` | [Get Surveys](./ghl/surveys/get-surveys.md) |
| `GET` | `/surveys/submissions` | [Get Surveys Submissions](./ghl/surveys/get-surveys-submissions.md) |

### `users` (6 endpoints)

Páginas de contexto: [Search](./ghl/users/search.md), [Users API v3](./ghl/users/users-api-v-3.md), [Users](./ghl/users/users.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/users/` | [Create User](./ghl/users/create-user.md) |
| `DELETE` | `/users/:userId` | [Delete User](./ghl/users/delete-user.md) |
| `GET` | `/users/:userId` | [Get User](./ghl/users/get-user.md) |
| `PUT` | `/users/:userId` | [Update User](./ghl/users/update-user.md) |
| `GET` | `/users/search` | [Search Users](./ghl/users/search-users.md) |
| `POST` | `/users/search/filter-by-email` | [Filter Users by Email](./ghl/users/filter-users-by-email.md) |

### `voice-ai` (11 endpoints)

Páginas de contexto: [Actions](./ghl/voice-ai/actions.md), [Agents](./ghl/voice-ai/agents.md), [Dashboard](./ghl/voice-ai/dashboard.md), [Voice AI API](./ghl/voice-ai/voice-ai-api.md)

| Método | Path | Página |
| --- | --- | --- |
| `POST` | `/voice-ai/actions` | [Create Agent Action](./ghl/voice-ai/create-action.md) |
| `DELETE` | `/voice-ai/actions/:actionId` | [Delete Agent Action](./ghl/voice-ai/delete-action.md) |
| `GET` | `/voice-ai/actions/:actionId` | [Get Agent Action](./ghl/voice-ai/get-action.md) |
| `PUT` | `/voice-ai/actions/:actionId` | [Update Agent Action](./ghl/voice-ai/update-action.md) |
| `GET` | `/voice-ai/agents` | [List Agents](./ghl/voice-ai/get-agents.md) |
| `POST` | `/voice-ai/agents` | [Create Agent](./ghl/voice-ai/create-agent.md) |
| `DELETE` | `/voice-ai/agents/:agentId` | [Delete Agent](./ghl/voice-ai/delete-agent.md) |
| `GET` | `/voice-ai/agents/:agentId` | [Get Agent](./ghl/voice-ai/get-agent.md) |
| `PATCH` | `/voice-ai/agents/:agentId` | [Patch Agent](./ghl/voice-ai/patch-agent.md) |
| `GET` | `/voice-ai/dashboard/call-logs` | [List Call Logs](./ghl/voice-ai/get-call-logs.md) |
| `GET` | `/voice-ai/dashboard/call-logs/:callId` | [Get Call Log](./ghl/voice-ai/get-call-log.md) |

### `workflows` (1 endpoints)

Páginas de contexto: [workflows API](./ghl/workflows/workflows-api.md), [Workflows](./ghl/workflows/workflows.md)

| Método | Path | Página |
| --- | --- | --- |
| `GET` | `/workflows/` | [Get Workflow](./ghl/workflows/get-workflow.md) |

---

## Webhooks

| Evento | Página | Descripción |
| --- | --- | --- |
| `AppInstall` | [App](./webhook/AppInstall.md) | Called whenever an app is installed |
| `AppPaymentStatus` | [App Payment Status](./webhook/AppPaymentStatus.md) | Called whenever the payment status of a paid app subscription changes — for example when a recurring payment fails during dunning, or when a previously failed payment is successfully recovered. |
| `AppUninstall` | [App](./webhook/AppUninstall.md) | Called whenever an app is uninstalled |
| `AppUpdate` | [App](./webhook/AppUpdate.md) | Called whenever an app is updated to a new version |
| `AppointmentCreate` | [Appointment](./webhook/AppointmentCreate.md) | Called whenever an appointment is created |
| `AppointmentDelete` | [Appointment](./webhook/AppointmentDelete.md) | Called whenever an appointment is deleted |
| `AppointmentUpdate` | [Appointment](./webhook/AppointmentUpdate.md) | Called whenever an appointment is updated |
| `AssociationCreate` | [Association Created](./webhook/AssociationCreate.md) | This webhook response is triggered when a new association is created between objects, such as linking contacts to custom objects. Currently, only contact-to-contact , contact to custom object and cust |
| `AssociationDelete` | [Association Deleted](./webhook/AssociationDelete.md) | This webhook response is triggered when a new association is deleted between objects, such as linking contacts to custom objects. Currently, only contact-to-contact , contact to custom object and cust |
| `AssociationUpdate` | [Association Updated](./webhook/AssociationUpdate.md) | This webhook response is triggered when a new association is updated between objects, such as linking contacts to custom objects. Currently, only contact-to-contact , contact to custom object and cust |
| `CampaignStatusUpdate` | [Campaign](./webhook/CampaignStatusUpdate.md) | Called whenever a campaign status is updated |
| `ContactCreate` | [Contact](./webhook/ContactCreate.md) | Called whenever a contact is created |
| `ContactDelete` | [Contact](./webhook/ContactDelete.md) | Called whenever a contact is deleted |
| `ContactDndUpdate` | [Contact](./webhook/ContactDndUpdate.md) | Called whenever a contact's dnd field is updated |
| `ContactTagUpdate` | [Contact](./webhook/ContactTagUpdate.md) | Called whenever a contact's tag field is updated |
| `ContactUpdate` | [Contact](./webhook/ContactUpdate.md) | Called whenever the specific fields in contact is updated |
| `ConversationUnreadWebhook` | [Conversation](./webhook/ConversationUnreadWebhook.md) | Called whenever a conversations unread status is updated |
| `ConversationUpdate` | [ConversationUpdate](./webhook/ConversationUpdate.md) | Called whenever a live chat conversation is merged into another conversation due to contact identification (e.g. a visitor provides their email or phone number matching an existing contact). |
| `ExternalAuthConnected` | [EXTERNAL_AUTH_CONNECTED](./webhook/ExternalAuthConnected.md) | Called whenever external authentication (OAuth2 or Basic) is connected successfully for an app/location/company. |
| `InboundMessage` | [InboundMessage](./webhook/InboundMessage.md) | Called whenever a contact sends a message to the user. |
| `InvoiceCreate` | [Invoice](./webhook/InvoiceCreate.md) | Called whenever an invoice is created |
| `InvoiceDelete` | [Invoice](./webhook/InvoiceDelete.md) | Called whenever an invoice is deleted |
| `InvoicePaid` | [Invoice](./webhook/InvoicePaid.md) | Called whenever an invoice is paid |
| `InvoicePartiallyPaid` | [Invoice](./webhook/InvoicePartiallyPaid.md) | Called whenever an invoice is partially paid |
| `InvoiceSent` | [Invoice](./webhook/InvoiceSent.md) | Called whenever an invoice is sent |
| `InvoiceUpdate` | [Invoice](./webhook/InvoiceUpdate.md) | Called whenever an invoice is updated |
| `InvoiceVoid` | [Invoice](./webhook/InvoiceVoid.md) | Called whenever an invoice is marked as void |
| `KnowledgeBaseCreate` | [Knowledge Base](./webhook/KnowledgeBaseCreate.md) | Called whenever a knowledge base is created |
| `KnowledgeBaseDelete` | [Knowledge Base](./webhook/KnowledgeBaseDelete.md) | Called whenever a knowledge base is deleted |
| `KnowledgeBaseFaqChange` | [Knowledge Base Asset](./webhook/KnowledgeBaseFaqChange.md) | Called whenever a knowledge base **FAQ** asset is created, updated or deleted |
| `KnowledgeBaseFileChange` | [Knowledge Base Asset](./webhook/KnowledgeBaseFileChange.md) | Called whenever a knowledge base **file** asset is created, updated or deleted |
| `KnowledgeBaseRichTextChange` | [Knowledge Base Asset](./webhook/KnowledgeBaseRichTextChange.md) | Called whenever a knowledge base **rich text** asset is created, updated or deleted |
| `KnowledgeBaseTableFileChange` | [Knowledge Base Asset](./webhook/KnowledgeBaseTableFileChange.md) | Called whenever a knowledge base **table file** asset is created, updated or deleted |
| `KnowledgeBaseTrainedUrlChange` | [Knowledge Base Asset](./webhook/KnowledgeBaseTrainedUrlChange.md) | Called whenever a knowledge base **trained URL** asset is created, updated or deleted |
| `KnowledgeBaseUpdate` | [Knowledge Base](./webhook/KnowledgeBaseUpdate.md) | Called whenever a knowledge base name/description is updated |
| `LCEmailStats` | [LC Email](./webhook/LCEmailStats.md) | Called whenever an email is sent, gives the statistics of the said email. |
| `LocationCreate` | [Location](./webhook/LocationCreate.md) | Called whenever a location is created. |
| `LocationUpdate` | [Location](./webhook/LocationUpdate.md) | Called whenever a location is updated. |
| `NoteCreate` | [Note](./webhook/NoteCreate.md) | Called whenever a note is created |
| `NoteDelete` | [Note](./webhook/NoteDelete.md) | Called whenever a note is deleted |
| `NoteUpdate` | [Note](./webhook/NoteUpdate.md) | Called whenever a note is updated |
| `ObjectSchemaCreate` | [Object Schema Create](./webhook/ObjectSchemaCreate.md) | The **Object Schema Create** is triggered whenever a custom object is created. This webhook allows systems to listen for new custom objects and take appropriate actions based on the event. |
| `ObjectSchemaUpdate` | [Update Custom Object](./webhook/ObjectSchemaUpdate.md) | The **Update Custom Object** is triggered whenever a custom object is Updated. This webhook allows systems to listen for new custom objects and take appropriate actions based on the event. |
| `OpportunityAssignedToUpdate` | [Opportunity](./webhook/OpportunityAssignedToUpdate.md) | Called whenever an opportunity's AssignedTo field is updated |
| `OpportunityCreate` | [Opportunity](./webhook/OpportunityCreate.md) | Called whenever an opportunity is created |
| `OpportunityDelete` | [Opportunity](./webhook/OpportunityDelete.md) | Called whenever an opportunity is deleted |
| `OpportunityMonetaryValueUpdate` | [Opportunity](./webhook/OpportunityMonetaryValueUpdate.md) | Called whenever an opportunity's monetary value field is updated |
| `OpportunityStageUpdate` | [Opportunity](./webhook/OpportunityStageUpdate.md) | Called whenever an opportunity's stage field is updated |
| `OpportunityStatusUpdate` | [Opportunity](./webhook/OpportunityStatusUpdate.md) | Called whenever an opportunity's status field is updated |
| `OpportunityUpdate` | [Opportunity](./webhook/OpportunityUpdate.md) | Called whenever an opportunity is updated |
| `OrderCreate` | [Order](./webhook/OrderCreate.md) | Called whenever an order is created |
| `OrderStatusUpdate` | [Order](./webhook/OrderStatusUpdate.md) | Called whenever an order's status field updated |
| `OutboundMessage` | [OutboundMessage](./webhook/OutboundMessage.md) | Called whenever a user sends a message to a contact. |
| `PlanChange` | [Plan Change](./webhook/PlanChange.md) | Called whenever user changes the plan for a paid app. |
| `PriceCreate` | [Price](./webhook/PriceCreate.md) | Called whenever a price is created |
| `PriceDelete` | [Price](./webhook/PriceDelete.md) | Called whenever a price is deleted |
| `PriceUpdate` | [Price](./webhook/PriceUpdate.md) | Called whenever a price is updated |
| `ProductCreate` | [Product](./webhook/ProductCreate.md) | Called whenever a product is created |
| `ProductDelete` | [Product](./webhook/ProductDelete.md) | Called whenever a product is deleted |
| `ProductUpdate` | [Product](./webhook/ProductUpdate.md) | Called whenever a product is updated |
| `ProviderOutboundMessage` | [Conversation Provider - Outbound Message](./webhook/ProviderOutboundMessage.md) | Called whenever a user sends a message to a contact and has a custom provider as the default channel in the settings. |
| `RecordCreate` | [Record Create](./webhook/RecordCreate.md) | This webhook response is triggered when a new record or business is created. |
| `RecordDelete` | [Delete Record](./webhook/RecordDelete.md) | The `Delete Record` is triggered whenever a record or business (company) is deleted from the system. |
| `RecordUpdate` | [Record Update](./webhook/RecordUpdate.md) | This webhook response is triggered when a record or business is updated. |
| `RelationCreate` | [Relation Create](./webhook/RelationCreate.md) | This webhook response is triggered when an relation between objects is created. |
| `RelationDelete` | [Relation Delete](./webhook/RelationDelete.md) | This webhook response is triggered when an existing relation between objects is deleted. |
| `SaaSPlanCreate` | [SaaS Plan Created](./webhook/SaaSPlanCreate.md) | This webhook response is triggered when a new SaaS subscription plan is created in the system. The webhook provides comprehensive information about the plan including its features, pricing tiers, and  |
| `SupportTicketCreate` | [Support Ticket Create](./webhook/SupportTicketCreate.md) | Called whenever a new support ticket is created for an app. |
| `SupportTicketDelete` | [Support Ticket Delete](./webhook/SupportTicketDelete.md) | Called whenever a support ticket is deleted. |
| `SupportTicketUpdate` | [Support Ticket Update](./webhook/SupportTicketUpdate.md) | Called whenever a support ticket is updated — for example when its status changes, a reply is added to the conversation, or its details are edited. |
| `TaskComplete` | [Task](./webhook/TaskComplete.md) | Called whenever a task is completed |
| `TaskCreate` | [Task](./webhook/TaskCreate.md) | Called whenever a task is created |
| `TaskDelete` | [Task](./webhook/TaskDelete.md) | Called whenever a task is deleted |
| `UserCreate` | [User](./webhook/UserCreate.md) | Called whenever a user is created |
| `UserDelete` | [User](./webhook/UserDelete.md) | Called whenever a user is deleted |
| `UserUpdate` | [User](./webhook/UserUpdate.md) | Called whenever a user is updated |
| `VoiceAiCallEnd` | [VoiceAiCallEnd](./webhook/VoiceAiCallEnd.md) | Called whenever a Voice AI call ends for a sub-account. |
| `WebhookIntegrationGuide` | [Webhook Integration Guide](./webhook/WebhookIntegrationGuide.md) | Webhooks are a way for applications to communicate in real-time. Think of them as **automatic notifications** that are sent to your application when something happens in our platform. |
| `WebhookLogsDashboard` | [Webhook Logs Dashboard](./webhook/WebhookLogsDashboard.md) | The Webhook Logs Dashboard provides comprehensive monitoring and troubleshooting capabilities for webhook deliveries in your marketplace application. This guide covers how to access, navigate, and eff |
