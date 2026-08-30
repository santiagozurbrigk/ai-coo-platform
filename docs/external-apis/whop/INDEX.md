# Whop — índice de la documentación capturada

Copia local de `https://docs.whop.com` — 897 páginas, capturadas el **2026-08-30**.

La definición de cada endpoint **no** está en su página: Whop publica specs OpenAPI
oficiales y cada página del `api-reference` re-embebe el spec entero. Acá los specs
se guardan una sola vez y la referencia legible se genera desde ellos.

| Archivo | Qué es |
| --- | --- |
| [`RESUMEN-OTC.md`](./RESUMEN-OTC.md) | **Empezar por acá** — lo que OTC necesita de Whop, con las preguntas de `API_DOCS_PENDIENTES.md` §1 respondidas |
| [`ENDPOINTS-api-v1-native.md`](./ENDPOINTS-api-v1-native.md) | Referencia de la API versionada (la de integraciones nuevas) |
| [`ENDPOINTS-api-v1-stable.md`](./ENDPOINTS-api-v1-stable.md) | Referencia de los recursos legacy |
| [`ENDPOINTS-ledger-stats.md`](./ENDPOINTS-ledger-stats.md) | Wallet Stats API |
| [`openapi/`](./openapi/) | Los specs oficiales, tal como los sirve Whop |

---

## Páginas por sección

- Páginas totales: **897**
- Páginas que documentan un endpoint concreto: **449**

### `account-settings/account-security` (2)

- [Delete your account](./account-settings/account-security/delete-your-account.md) — Permanently delete your Whop user account from account settings.
- [Enable 2FA](./account-settings/account-security/enable-2fa.md) — Add an extra layer of security to your Whop account by enabling two-factor authentication.

### `account-settings/overview` (1)

- [Overview](./account-settings/overview.md)

### `account-settings/personal-details` (4)

- [Hide approximate location](./account-settings/personal-details/hide-approximate-location.md) — Turn your approximate location, visible to other users, on or off from account settings.
- [Update email](./account-settings/personal-details/update-email.md) — Change the email address connected to your Whop account from account settings.
- [Update phone number](./account-settings/personal-details/update-phone-number.md) — Add or change the phone number saved on your Whop account from account settings.
- [Update username](./account-settings/personal-details/update-username.md) — Change your Whop display username from account settings.

### `add-apps` (1)

- [Add apps](./add-apps.md) — Learn how to add apps to your whop

### `affiliates/be-an-affiliate` (1)

- [Be an affiliate](./affiliates/be-an-affiliate.md) — Earn money by referring people to Whop offers using your affiliate link

### `affiliates/promote-your-business` (1)

- [Promote your business](./affiliates/promote-your-business.md) — Set up your affiliate program to automatically pay commissions when someone refers a new paying member to your whop

### `affiliates/setup-custom` (1)

- [Set up custom affiliates](./affiliates/setup-custom.md) — Promote your product across Whop’s network of affiliates

### `affiliates/setup-global` (1)

- [Set up global affiliates](./affiliates/setup-global.md) — Promote your product across Whop’s network of affiliates

### `affiliates/setup-rev-share` (1)

- [Set up revenue share](./affiliates/setup-rev-share.md) — Share revenue directly with partners per transaction using automatic Whop Payments payouts

### `api-reference/access-tokens` (2)

- [Access Token](./api-reference/access-tokens/access-token.md) — A short-lived access token used to authenticate API requests on behalf of a user.
- [Create access token](./api-reference/access-tokens/create-access-token.md) — `POST /access_tokens`

### `api-reference/account-links` (2)

- [Account Link](./api-reference/account-links/account-link.md) — A temporary, time-limited URL that grants a user access to an external account management page.
- [Create account link](./api-reference/account-links/create-account-link.md) — `POST /account_links`

### `api-reference/ad-campaigns` (1)

- [Ad campaigns](./api-reference/ad-campaigns/ad-campaign.md) — The Ad campaigns API is documented in the Whop API reference.

### `api-reference/ad-groups` (1)

- [Ad groups](./api-reference/ad-groups/ad-group.md) — The Ad groups API is documented in the Whop API reference.

### `api-reference/ad-reports` (2)

- [Ad Report](./api-reference/ad-reports/ad-report.md) — An ads performance report. Always returns a summary. The `granularity` field contains a per-bucket time series when the `granularity` arg is set; the 
- [Retrieve ad report](./api-reference/ad-reports/retrieve-ad-report.md) — `GET /ad_reports`

### `api-reference/ads` (1)

- [Ads](./api-reference/ads/ad.md) — The Ads API is documented in the Whop API reference.

### `api-reference/affiliates` (11)

- [Affiliate](./api-reference/affiliates/affiliate.md) — An affiliate tracks a user's referral performance and commission earnings for a company, including retention rates, revenue metrics, and payout config
- [Archive affiliate](./api-reference/affiliates/archive-affiliate.md) — `POST /affiliates/{id}/archive`
- [Create affiliate](./api-reference/affiliates/create-affiliate.md) — `POST /affiliates`
- [Create override](./api-reference/affiliates/create-override.md) — `POST /affiliates/{id}/overrides`
- [Delete override](./api-reference/affiliates/delete-override.md) — `DELETE /affiliates/{id}/overrides/{override_id}`
- [List affiliates](./api-reference/affiliates/list-affiliates.md) — `GET /affiliates`
- [List overrides](./api-reference/affiliates/list-overrides.md) — `GET /affiliates/{id}/overrides`
- [Retrieve affiliate](./api-reference/affiliates/retrieve-affiliate.md) — `GET /affiliates/{id}`
- [Retrieve override](./api-reference/affiliates/retrieve-override.md) — `GET /affiliates/{id}/overrides/{override_id}`
- [Unarchive affiliate](./api-reference/affiliates/unarchive-affiliate.md) — `POST /affiliates/{id}/unarchive`
- [Update override](./api-reference/affiliates/update-override.md) — `PATCH /affiliates/{id}/overrides/{override_id}`

### `api-reference/ai-chats` (6)

- [Ai Chat](./api-reference/ai-chats/ai-chat.md) — An AI-powered chat conversation belonging to a user, with optional scheduled automation.
- [Create ai chat](./api-reference/ai-chats/create-ai-chat.md) — `POST /ai_chats`
- [Delete ai chat](./api-reference/ai-chats/delete-ai-chat.md) — `DELETE /ai_chats/{id}`
- [List ai chats](./api-reference/ai-chats/list-ai-chats.md) — `GET /ai_chats`
- [Retrieve ai chat](./api-reference/ai-chats/retrieve-ai-chat.md) — `GET /ai_chats/{id}`
- [Update ai chat](./api-reference/ai-chats/update-ai-chat.md) — `PATCH /ai_chats/{id}`

### `api-reference/app-builds` (5)

- [App Build](./api-reference/app-builds/app-build.md) — A versioned build artifact for a Whop React Native App, submitted for review and deployment to a specific platform.
- [Create app build](./api-reference/app-builds/create-app-build.md) — `POST /app_builds`
- [List app builds](./api-reference/app-builds/list-app-builds.md) — `GET /app_builds`
- [Promote app build](./api-reference/app-builds/promote-app-build.md) — `POST /app_builds/{id}/promote`
- [Retrieve app build](./api-reference/app-builds/retrieve-app-build.md) — `GET /app_builds/{id}`

### `api-reference/apps` (6)

- [App](./api-reference/apps/app.md) — An app is an integration built on Whop. Apps can serve consumers as experiences within products, or serve companies as business tools.
- [Create app](./api-reference/apps/create-app.md) — `POST /apps`
- [List apps](./api-reference/apps/list-apps.md) — `GET /apps`
- [Retrieve app](./api-reference/apps/retrieve-app.md) — `GET /apps/{id}`
- [Update app](./api-reference/apps/update-app.md) — `PATCH /apps/{id}`
- [Update requested permissions](./api-reference/apps/update-requested-permissions.md) — `PATCH /apps/{app_id}/permissions`

### `api-reference/authorized-users` (5)

- [Authorized User](./api-reference/authorized-users/authorized-user.md) — A user who belongs to a company's team with access determined by their assigned role.
- [Create authorized user](./api-reference/authorized-users/create-authorized-user.md) — `POST /authorized_users`
- [Delete authorized user](./api-reference/authorized-users/delete-authorized-user.md) — `DELETE /authorized_users/{id}`
- [List authorized users](./api-reference/authorized-users/list-authorized-users.md) — `GET /authorized_users`
- [Retrieve authorized user](./api-reference/authorized-users/retrieve-authorized-user.md) — `GET /authorized_users/{id}`

### `api-reference/beta` (333)

- [Account updated](./api-reference/beta/accounts/account-updated.md) — Sent when an account is updated
- [Account](./api-reference/beta/accounts/account.md)
- [Create Account](./api-reference/beta/accounts/create-account.md) — `POST /accounts`
- [Form Company](./api-reference/beta/accounts/form-company.md) — `POST /accounts/{id}/form_company`
- [List Account Reserves](./api-reference/beta/accounts/list-account-reserves.md) — `GET /accounts/{account_id}/reserves`
- [List Accounts](./api-reference/beta/accounts/list-accounts.md) — `GET /accounts`
- [Retrieve Account Preferences](./api-reference/beta/accounts/retrieve-account-preferences.md) — `GET /accounts/{account_id}/preferences`
- [Retrieve Account](./api-reference/beta/accounts/retrieve-account.md) — `GET /accounts/{id}`
- [Suspend a Connected Account](./api-reference/beta/accounts/suspend-a-connected-account.md) — `POST /accounts/{id}/suspend`
- [Transfer Account Ownership](./api-reference/beta/accounts/transfer-account-ownership.md) — `POST /accounts/{id}/transfer_ownership`
- [Update Account Preferences](./api-reference/beta/accounts/update-account-preferences.md) — `PATCH /accounts/{account_id}/preferences`
- [Update Account](./api-reference/beta/accounts/update-account.md) — `PATCH /accounts/{id}`
- [Ad campaign payment failed](./api-reference/beta/ad-campaigns/ad-campaign-payment-failed.md) — Sent when an ad campaign's payment fails and its ads stop delivering
- [Ad Campaign](./api-reference/beta/ad-campaigns/ad-campaign.md)
- [Create an Ad Campaign](./api-reference/beta/ad-campaigns/create-an-ad-campaign.md) — `POST /ad_campaigns`
- [Delete an Ad Campaign](./api-reference/beta/ad-campaigns/delete-an-ad-campaign.md) — `DELETE /ad_campaigns/{id}`
- [Duplicate an Ad Campaign](./api-reference/beta/ad-campaigns/duplicate-an-ad-campaign.md) — `POST /ad_campaigns/{id}/duplicate`
- [List Ad Campaigns](./api-reference/beta/ad-campaigns/list-ad-campaigns.md) — `GET /ad_campaigns`
- [Pause an Ad Campaign](./api-reference/beta/ad-campaigns/pause-an-ad-campaign.md) — `POST /ad_campaigns/{id}/pause`
- [Retrieve an Ad Campaign](./api-reference/beta/ad-campaigns/retrieve-an-ad-campaign.md) — `GET /ad_campaigns/{id}`
- [Retry a Failed Ad Campaign Payment](./api-reference/beta/ad-campaigns/retry-a-failed-ad-campaign-payment.md) — `POST /ad_campaigns/{id}/retry_payment`
- [Unpause an Ad Campaign](./api-reference/beta/ad-campaigns/unpause-an-ad-campaign.md) — `POST /ad_campaigns/{id}/unpause`
- [Update an Ad Campaign](./api-reference/beta/ad-campaigns/update-an-ad-campaign.md) — `PATCH /ad_campaigns/{id}`
- [Ad Group](./api-reference/beta/ad-groups/ad-group.md)
- [Create an Ad Group](./api-reference/beta/ad-groups/create-an-ad-group.md) — `POST /ad_groups`
- [Delete an Ad Group](./api-reference/beta/ad-groups/delete-an-ad-group.md) — `DELETE /ad_groups/{id}`
- [Duplicate an Ad Group](./api-reference/beta/ad-groups/duplicate-an-ad-group.md) — `POST /ad_groups/{id}/duplicate`
- [Estimate Ad Group Reach](./api-reference/beta/ad-groups/estimate-ad-group-reach.md) — `POST /ad_groups/estimate_reach`
- [List Ad Groups](./api-reference/beta/ad-groups/list-ad-groups.md) — `GET /ad_groups`
- [Pause an Ad Group](./api-reference/beta/ad-groups/pause-an-ad-group.md) — `POST /ad_groups/{id}/pause`
- [Retrieve an Ad Group](./api-reference/beta/ad-groups/retrieve-an-ad-group.md) — `GET /ad_groups/{id}`
- [Search Targeting Options](./api-reference/beta/ad-groups/search-targeting-options.md) — `GET /ad_groups/targeting_options`
- [Unpause an Ad Group](./api-reference/beta/ad-groups/unpause-an-ad-group.md) — `POST /ad_groups/{id}/unpause`
- [Update an Ad Group](./api-reference/beta/ad-groups/update-an-ad-group.md) — `PATCH /ad_groups/{id}`
- [Ad](./api-reference/beta/ads/ad.md)
- [Create an Ad](./api-reference/beta/ads/create-an-ad.md) — `POST /ads`
- [Delete an Ad](./api-reference/beta/ads/delete-an-ad.md) — `DELETE /ads/{id}`
- [Duplicate an Ad](./api-reference/beta/ads/duplicate-an-ad.md) — `POST /ads/{id}/duplicate`
- [List Ads](./api-reference/beta/ads/list-ads.md) — `GET /ads`
- [Overview](./api-reference/beta/ads/overview.md)
- [Pause an Ad](./api-reference/beta/ads/pause-an-ad.md) — `POST /ads/{id}/pause`
- [Retrieve an Ad](./api-reference/beta/ads/retrieve-an-ad.md) — `GET /ads/{id}`
- [Unpause an Ad](./api-reference/beta/ads/unpause-an-ad.md) — `POST /ads/{id}/unpause`
- [Update an Ad](./api-reference/beta/ads/update-an-ad.md) — `PATCH /ads/{id}`
- [API Key](./api-reference/beta/api-keys/api-key.md)
- [Create API Key](./api-reference/beta/api-keys/create-api-key.md) — `POST /api_keys`
- [Delete API Key](./api-reference/beta/api-keys/delete-api-key.md) — `DELETE /api_keys/{id}`
- [List API Keys](./api-reference/beta/api-keys/list-api-keys.md) — `GET /api_keys`
- [List the Permission Catalog](./api-reference/beta/api-keys/list-the-permission-catalog.md) — `GET /api_keys/permissions`
- [Retrieve API Key](./api-reference/beta/api-keys/retrieve-api-key.md) — `GET /api_keys/{id}`
- [Rotate API Key](./api-reference/beta/api-keys/rotate-api-key.md) — `POST /api_keys/{id}/rotate`
- [Update API Key](./api-reference/beta/api-keys/update-api-key.md) — `PATCH /api_keys/{id}`
- [List Api Logs](./api-reference/beta/api-logs/list-api-logs.md) — `GET /api_logs`
- [App Build](./api-reference/beta/app-builds/app-build.md)
- [Create App Build](./api-reference/beta/app-builds/create-app-build.md) — `POST /app_builds`
- [List App Builds](./api-reference/beta/app-builds/list-app-builds.md) — `GET /app_builds`
- [Promote App Build](./api-reference/beta/app-builds/promote-app-build.md) — `POST /app_builds/{id}/promote`
- [Retrieve App Build](./api-reference/beta/app-builds/retrieve-app-build.md) — `GET /app_builds/{id}`
- [App](./api-reference/beta/apps/app.md)
- [Create App](./api-reference/beta/apps/create-app.md) — `POST /apps`
- [Delete App](./api-reference/beta/apps/delete-app.md) — `DELETE /apps/{id}`
- [Deploy App](./api-reference/beta/apps/deploy-app.md) — `POST /apps/{id}/deploy`
- [List App Logs](./api-reference/beta/apps/list-app-logs.md) — `GET /apps/{id}/logs`
- [List Apps](./api-reference/beta/apps/list-apps.md) — `GET /apps`
- [Retrieve App](./api-reference/beta/apps/retrieve-app.md) — `GET /apps/{id}`
- [Update App Permissions](./api-reference/beta/apps/update-app-permissions.md) — `PATCH /apps/{id}/permissions`
- [Update App](./api-reference/beta/apps/update-app.md) — `PATCH /apps/{id}`
- [Add People](./api-reference/beta/audiences/add-people.md) — `POST /audiences/{id}/add_people`
- [Audience](./api-reference/beta/audiences/audience.md)
- [Create](./api-reference/beta/audiences/create-audience.md) — `POST /audiences`
- [Delete Audience](./api-reference/beta/audiences/delete-audience.md) — `DELETE /audiences/{id}`
- [List Audiences](./api-reference/beta/audiences/list-audiences.md) — `GET /audiences`
- [Update Audience](./api-reference/beta/audiences/update-audience.md) — `PATCH /audiences/{id}`
- [Bounty](./api-reference/beta/bounties/bounty.md)
- [Cancel](./api-reference/beta/bounties/cancel.md) — `POST /bounties/{id}/cancel`
- [Create Bounty](./api-reference/beta/bounties/create-bounty.md) — `POST /bounties`
- [List Bounties](./api-reference/beta/bounties/list-bounties.md) — `GET /bounties`
- [List Public Submissions](./api-reference/beta/bounties/list-public-submissions.md) — `GET /bounties/{bounty_id}/submissions`
- [Retrieve Bounty](./api-reference/beta/bounties/retrieve-bounty.md) — `GET /bounties/{id}`
- [Retrieve Public Submission](./api-reference/beta/bounties/retrieve-public-submission.md) — `GET /bounties/{bounty_id}/submissions/{id}`
- [Update Bounty](./api-reference/beta/bounties/update-bounty.md) — `PATCH /bounties/{id}`
- [Cancel Bounty Submission](./api-reference/beta/bounty-submissions/cancel-bounty-submission.md) — `DELETE /bounty_submissions/{id}`
- [Create Bounty Submission](./api-reference/beta/bounty-submissions/create-bounty-submission.md) — `POST /bounty_submissions`
- [List Bounty Submissions](./api-reference/beta/bounty-submissions/list-bounty-submissions.md) — `GET /bounty_submissions`
- [Retrieve Bounty Submission](./api-reference/beta/bounty-submissions/retrieve-bounty-submission.md) — `GET /bounty_submissions/{id}`
- [Submit Bounty Submission](./api-reference/beta/bounty-submissions/submit-bounty-submission.md) — `POST /bounty_submissions/{id}/submit`
- [Card application approved](./api-reference/beta/cards/card-application-approved.md) — Sent when a card application is approved
- [Card application created](./api-reference/beta/cards/card-application-created.md) — Sent when a card application is created
- [Card application denied](./api-reference/beta/cards/card-application-denied.md) — Sent when a card application is denied
- [Card application updated](./api-reference/beta/cards/card-application-updated.md) — Sent when a card application is updated
- [Card canceled](./api-reference/beta/cards/card-canceled.md) — Sent when a card is canceled
- [Card created](./api-reference/beta/cards/card-created.md) — Sent when a card is created
- [Card frozen](./api-reference/beta/cards/card-frozen.md) — Sent when a card is frozen
- [Card updated](./api-reference/beta/cards/card-updated.md) — Sent when a card is updated
- [Cards](./api-reference/beta/cards/card.md)
- [Cardtransaction completed](./api-reference/beta/cards/cardtransaction-completed.md) — Sent when a card transaction is completed
- [Cardtransaction created](./api-reference/beta/cards/cardtransaction-created.md) — Sent when a card transaction is created
- [Cardtransaction declined](./api-reference/beta/cards/cardtransaction-declined.md) — Sent when a card transaction is declined
- [Cardtransaction reversed](./api-reference/beta/cards/cardtransaction-reversed.md) — Sent when a card transaction is reversed
- [Cardtransaction updated](./api-reference/beta/cards/cardtransaction-updated.md) — Sent when a card transaction is updated
- [Create Card](./api-reference/beta/cards/create-card.md) — `POST /cards`
- [List Card Transactions](./api-reference/beta/cards/list-card-transactions.md) — `GET /card_transactions`
- [List Cards](./api-reference/beta/cards/list-cards.md) — `GET /cards`
- [Retrieve Card Transaction](./api-reference/beta/cards/retrieve-card-transaction.md) — `GET /card_transactions/{id}`
- [Retrieve Card](./api-reference/beta/cards/retrieve-card.md) — `GET /cards/{id}`
- [Update Card](./api-reference/beta/cards/update-card.md) — `PATCH /cards/{id}`
- [Checkout Configuration](./api-reference/beta/checkout-configurations/checkout-configuration.md)
- [Create a checkout configuration](./api-reference/beta/checkout-configurations/create-a-checkout-configuration.md) — `POST /checkout_configurations`
- [Delete a checkout configuration](./api-reference/beta/checkout-configurations/delete-a-checkout-configuration.md) — `DELETE /checkout_configurations/{id}`
- [List checkout configurations](./api-reference/beta/checkout-configurations/list-checkout-configurations.md) — `GET /checkout_configurations`
- [Retrieve a checkout configuration](./api-reference/beta/checkout-configurations/retrieve-a-checkout-configuration.md) — `GET /checkout_configurations/{id}`
- [Confirmation Token](./api-reference/beta/confirmation-tokens/confirmation-token.md)
- [Create Confirmation Token](./api-reference/beta/confirmation-tokens/create-confirmation-token.md) — `POST /confirmation_tokens`
- [Retrieve Confirmation Token](./api-reference/beta/confirmation-tokens/retrieve-confirmation-token.md) — `GET /confirmation_tokens/{id}`
- [Create Deposit](./api-reference/beta/deposits/create-deposit.md) — `POST /deposits`
- [Deposit succeeded](./api-reference/beta/deposits/deposit-succeeded.md) — Sent when a deposit is succeeded
- [Deposits](./api-reference/beta/deposits/deposit.md)
- [Dispute alert created](./api-reference/beta/dispute-alerts/dispute-alert-created.md) — Sent when a dispute alert is created
- [Dispute Alerts](./api-reference/beta/dispute-alerts/dispute-alert.md)
- [List Dispute Alerts](./api-reference/beta/dispute-alerts/list-dispute-alerts.md) — `GET /dispute_alerts`
- [Retrieve Dispute Alert](./api-reference/beta/dispute-alerts/retrieve-dispute-alert.md) — `GET /dispute_alerts/{id}`
- [Dispute created](./api-reference/beta/disputes/dispute-created.md) — Sent when a dispute is created
- [Dispute updated](./api-reference/beta/disputes/dispute-updated.md) — Sent when a dispute is updated
- [Disputes](./api-reference/beta/disputes/dispute.md)
- [List Disputes](./api-reference/beta/disputes/list-disputes.md) — `GET /disputes`
- [Retrieve Dispute Summary](./api-reference/beta/disputes/retrieve-dispute-summary.md) — `GET /disputes/summary`
- [Retrieve Dispute](./api-reference/beta/disputes/retrieve-dispute.md) — `GET /disputes/{id}`
- [Submit Dispute](./api-reference/beta/disputes/submit-dispute.md) — `POST /disputes/{id}/submit`
- [Update Dispute](./api-reference/beta/disputes/update-dispute.md) — `PATCH /disputes/{id}`
- [Upload Dispute Evidence](./api-reference/beta/disputes/upload-dispute-evidence.md) — `POST /disputes/{id}/upload_evidence`
- [Create Event](./api-reference/beta/events/create-event.md) — `POST /events`
- [Events](./api-reference/beta/events/event.md)
- [List Events](./api-reference/beta/events/list-events.md) — `GET /events`
- [Retrieve the pulse feed](./api-reference/beta/events/retrieve-the-pulse-feed.md) — `GET /events/pulse`
- [Validate Pixel](./api-reference/beta/events/validate-pixel.md) — `POST /events/validate_pixel`
- [Create Export](./api-reference/beta/exports/create-export.md) — `POST /exports`
- [Export completed](./api-reference/beta/exports/export-completed.md) — Sent when an export is completed
- [Export failed](./api-reference/beta/exports/export-failed.md) — Sent when an export is failed
- [List Exports](./api-reference/beta/exports/list-exports.md) — `GET /exports`
- [Retrieve Export](./api-reference/beta/exports/retrieve-export.md) — `GET /exports/{id}`
- [Complete File Multipart Upload](./api-reference/beta/files/complete-file-multipart-upload.md) — `POST /files/{id}/complete`
- [Create File](./api-reference/beta/files/create-file.md) — `POST /files`
- [List Files](./api-reference/beta/files/list-files.md) — `GET /files`
- [Retrieve File](./api-reference/beta/files/retrieve-file.md) — `GET /files/{id}`
- [Schema](./api-reference/beta/ledger-stats/schema.md) — `GET /api/v1/stats/schema`
- [Get time series](./api-reference/beta/ledger-stats/time-series.md) — `GET /api/v1/stats/time_series`
- [Get Financial Report Breakdown](./api-reference/beta/ledgers/get-financial-report-breakdown.md) — `GET /financial_reports/breakdown`
- [Get Financial Report](./api-reference/beta/ledgers/get-financial-report.md) — `GET /financial_reports`
- [Ledger Activity](./api-reference/beta/ledgers/ledger-activity.md)
- [List Financial Activity](./api-reference/beta/ledgers/list-financial-activity.md) — `GET /financial-activity`
- [Generate Media Asset](./api-reference/beta/media/generate-media-asset.md) — `POST /media/generate`
- [Media](./api-reference/beta/media/media.md)
- [Retrieve Media Asset](./api-reference/beta/media/retrieve-media-asset.md) — `GET /media/{id}`
- [List Member Logs](./api-reference/beta/members/list-member-logs.md) — `GET /members/{id}/logs`
- [List Members](./api-reference/beta/members/list-members.md) — `GET /members`
- [Member created](./api-reference/beta/members/member-created.md) — Sent when a member is created
- [Member](./api-reference/beta/members/member.md)
- [Retrieve Member](./api-reference/beta/members/retrieve-member.md) — `GET /members/{id}`
- [Cancel Membership](./api-reference/beta/memberships/cancel-membership.md) — `POST /memberships/{id}/cancel`
- [Extend Membership](./api-reference/beta/memberships/extend-membership.md) — `POST /memberships/{id}/extend`
- [Invite to a Membership](./api-reference/beta/memberships/invite-to-a-membership.md) — `POST /memberships/invite`
- [List Memberships](./api-reference/beta/memberships/list-memberships.md) — `GET /memberships`
- [Membership activated](./api-reference/beta/memberships/membership-activated.md) — Sent when a membership is activated
- [Membership cancel at period end changed](./api-reference/beta/memberships/membership-cancel-at-period-end-changed.md) — Sent when a membership is cancel at period end changed
- [Membership deactivated](./api-reference/beta/memberships/membership-deactivated.md) — Sent when a membership is deactivated
- [Membership trial ending soon](./api-reference/beta/memberships/membership-trial-ending-soon.md) — Sent when a membership is trial ending soon
- [Membership](./api-reference/beta/memberships/membership.md)
- [Pause Membership](./api-reference/beta/memberships/pause-membership.md) — `POST /memberships/{id}/pause`
- [Resume Membership](./api-reference/beta/memberships/resume-membership.md) — `POST /memberships/{id}/resume`
- [Retrieve Membership](./api-reference/beta/memberships/retrieve-membership.md) — `GET /memberships/{id}`
- [Transfer Membership](./api-reference/beta/memberships/transfer-membership.md) — `POST /memberships/{id}/transfer`
- [Update Membership](./api-reference/beta/memberships/update-membership.md) — `PATCH /memberships/{id}`
- [List Notification Badges](./api-reference/beta/notifications/list-notification-badges.md) — `GET /notifications/badges`
- [List Notification Topics](./api-reference/beta/notifications/list-notification-topics.md) — `GET /notifications/topics`
- [List Notifications](./api-reference/beta/notifications/list-notifications.md) — `GET /notifications`
- [Mark Notifications Read](./api-reference/beta/notifications/mark-notifications-read.md) — `POST /notifications/mark_read`
- [Retrieve Notification](./api-reference/beta/notifications/retrieve-notification.md) — `GET /notifications/{id}`
- [Send Notification](./api-reference/beta/notifications/send-notification.md) — `POST /notifications`
- [Overview](./api-reference/beta/overview.md) — What the API does, how requests work, and a map of every resource.
- [Enroll as a Whop partner](./api-reference/beta/partners/enroll-as-a-whop-partner.md) — `POST /partners`
- [List referred business earnings](./api-reference/beta/partners/list-referred-business-earnings.md) — `GET /partners/businesses/{id}/earnings`
- [List referred businesses](./api-reference/beta/partners/list-referred-businesses.md) — `GET /partners/businesses`
- [List the users the caller referred](./api-reference/beta/partners/list-the-users-the-caller-referred.md) — `GET /partners/referred_users`
- [Partners](./api-reference/beta/partners/partner.md)
- [Retrieve a referred business](./api-reference/beta/partners/retrieve-a-referred-business.md) — `GET /partners/businesses/{id}`
- [Retrieve the leaderboard](./api-reference/beta/partners/retrieve-the-leaderboard.md) — `GET /partners/leaderboard`
- [Create Payment Method Domain](./api-reference/beta/payment-method-domains/create-payment-method-domain.md) — `POST /payment_method_domains`
- [Delete Payment Method Domain](./api-reference/beta/payment-method-domains/delete-payment-method-domain.md) — `DELETE /payment_method_domains/{id}`
- [List Payment Method Domains](./api-reference/beta/payment-method-domains/list-payment-method-domains.md) — `GET /payment_method_domains`
- [Payment Method Domain](./api-reference/beta/payment-method-domains/payment-method-domain.md)
- [Retrieve Payment Method Domain](./api-reference/beta/payment-method-domains/retrieve-payment-method-domain.md) — `GET /payment_method_domains/{id}`
- [Verify Payment Method Domain](./api-reference/beta/payment-method-domains/verify-payment-method-domain.md) — `POST /payment_method_domains/{id}/verify`
- [Capture payment](./api-reference/beta/payments/capture-payment.md) — `POST /payments/{id}/capture`
- [Retrieve payment status](./api-reference/beta/payments/retrieve-payment-status.md) — `GET /payments/{payment_id}/status`
- [Update payment return URL](./api-reference/beta/payments/update-payment-return-url.md) — `PATCH /payments/{payment_id}/return_url`
- [Cancel Payout](./api-reference/beta/payouts/cancel-payout.md) — `POST /payouts/{id}/cancel`
- [Create Payout Quote](./api-reference/beta/payouts/create-payout-quote.md) — `POST /payouts/quotes`
- [Create Payout](./api-reference/beta/payouts/create-payout.md) — `POST /payouts`
- [Create Saved Payout Method](./api-reference/beta/payouts/create-saved-payout-method.md) — `POST /payouts/methods`
- [Delete Saved Payout Method](./api-reference/beta/payouts/delete-saved-payout-method.md) — `DELETE /payouts/methods/{id}`
- [List Payouts](./api-reference/beta/payouts/list-payouts.md) — `GET /payouts`
- [List Saved Payout Methods](./api-reference/beta/payouts/list-saved-payout-methods.md) — `GET /payouts/methods`
- [List Supported Payout Methods](./api-reference/beta/payouts/list-supported-payout-methods.md) — `GET /payouts/supported_methods`
- [Payout created](./api-reference/beta/payouts/payout-created.md) — Sent when a payout is created (this event family replaces withdrawal.*)
- [Payout reversed](./api-reference/beta/payouts/payout-reversed.md) — Sent when a settled payout is reversed and the funds return to the balance (this event family replaces withdrawal.*)
- [Payout updated](./api-reference/beta/payouts/payout-updated.md) — Sent when a payout's status changes (this event family replaces withdrawal.*)
- [Payouts](./api-reference/beta/payouts/payout.md)
- [Payoutmethod created](./api-reference/beta/payouts/payoutmethod-created.md) — Sent when a payout method is created
- [Retrieve Payout](./api-reference/beta/payouts/retrieve-payout.md) — `GET /payouts/{id}`
- [Update Saved Payout Method](./api-reference/beta/payouts/update-saved-payout-method.md) — `PATCH /payouts/methods/{id}`
- [List People](./api-reference/beta/people/list-people.md) — `GET /people`
- [People](./api-reference/beta/people/person.md)
- [Retrieve Person](./api-reference/beta/people/retrieve-person.md) — `GET /people/{id}`
- [Check Permissions](./api-reference/beta/permissions/check-permissions.md) — `GET /permissions`
- [Permission](./api-reference/beta/permissions/permission.md)
- [Calculate Tax](./api-reference/beta/plans/calculate-tax.md) — `POST /plans/{id}/calculate_tax`
- [Create Plan](./api-reference/beta/plans/create-plan.md) — `POST /plans`
- [Delete Plan](./api-reference/beta/plans/delete-plan.md) — `DELETE /plans/{id}`
- [List Plans](./api-reference/beta/plans/list-plans.md) — `GET /plans`
- [Plan created](./api-reference/beta/plans/plan-created.md) — Sent when a plan is created
- [Plan deleted](./api-reference/beta/plans/plan-deleted.md) — Sent when a plan is deleted
- [Plan updated](./api-reference/beta/plans/plan-updated.md) — Sent when a plan is updated
- [Plan](./api-reference/beta/plans/plan.md)
- [Retrieve Plan](./api-reference/beta/plans/retrieve-plan.md) — `GET /plans/{id}`
- [Update Plan](./api-reference/beta/plans/update-plan.md) — `PATCH /plans/{id}`
- [Create Product](./api-reference/beta/products/create-product.md) — `POST /products`
- [Delete Product](./api-reference/beta/products/delete-product.md) — `DELETE /products/{id}`
- [List Products](./api-reference/beta/products/list-products.md) — `GET /products`
- [Product created](./api-reference/beta/products/product-created.md) — Sent when a product is created
- [Product deleted](./api-reference/beta/products/product-deleted.md) — Sent when a product is deleted
- [Product published](./api-reference/beta/products/product-published.md) — Sent when a product is published
- [Product unpublished](./api-reference/beta/products/product-unpublished.md) — Sent when a product is unpublished
- [Product updated](./api-reference/beta/products/product-updated.md) — Sent when a product is updated
- [Product](./api-reference/beta/products/product.md)
- [Publish Product](./api-reference/beta/products/publish-product.md) — `POST /products/{id}/publish`
- [Retrieve Product](./api-reference/beta/products/retrieve-product.md) — `GET /products/{id}`
- [Unpublish Product](./api-reference/beta/products/unpublish-product.md) — `POST /products/{id}/unpublish`
- [Update Product](./api-reference/beta/products/update-product.md) — `PATCH /products/{id}`
- [Activate Promo Code](./api-reference/beta/promo-codes/activate-promo-code.md) — `POST /promo_codes/{id}/activate`
- [Create Promo Code](./api-reference/beta/promo-codes/create-promo-code.md) — `POST /promo_codes`
- [Deactivate Promo Code](./api-reference/beta/promo-codes/deactivate-promo-code.md) — `POST /promo_codes/{id}/deactivate`
- [Delete Promo Code](./api-reference/beta/promo-codes/delete-promo-code.md) — `DELETE /promo_codes/{id}`
- [List Promo Codes](./api-reference/beta/promo-codes/list-promo-codes.md) — `GET /promo_codes`
- [Retrieve Promo Code](./api-reference/beta/promo-codes/retrieve-promo-code.md) — `GET /promo_codes/{id}`
- [Quickstart](./api-reference/beta/quickstart.md) — Make your first call in about a minute, then create a checkout link that takes real payments.
- [Execute Action Chain](./api-reference/beta/recommended-actions/execute-action-chain.md) — `POST /recommended_actions/{id}`
- [List Action Chains](./api-reference/beta/recommended-actions/list-action-chains.md) — `GET /recommended_actions`
- [List Recommended Action Executions](./api-reference/beta/recommended-actions/list-recommended-action-executions.md) — `GET /recommended_actions/{id}/executions`
- [Retrieve Action Chain](./api-reference/beta/recommended-actions/retrieve-action-chain.md) — `GET /recommended_actions/{id}`
- [Accept a Case](./api-reference/beta/resolution-center-cases/accept-a-case.md) — `POST /resolution_center_cases/{id}/accept`
- [Appeal a Case](./api-reference/beta/resolution-center-cases/appeal-a-case.md) — `POST /resolution_center_cases/{id}/appeal`
- [Deny a Case](./api-reference/beta/resolution-center-cases/deny-a-case.md) — `POST /resolution_center_cases/{id}/deny`
- [List Resolution Center Case Events](./api-reference/beta/resolution-center-cases/list-resolution-center-case-events.md) — `GET /resolution_center_cases/{id}/events`
- [List Resolution Center Cases](./api-reference/beta/resolution-center-cases/list-resolution-center-cases.md) — `GET /resolution_center_cases`
- [Open a Case as the Customer](./api-reference/beta/resolution-center-cases/open-a-case-as-the-customer.md) — `POST /resolution_center_cases`
- [Reply to a Case](./api-reference/beta/resolution-center-cases/reply-to-a-case.md) — `POST /resolution_center_cases/{id}/reply`
- [Request Information from the Customer](./api-reference/beta/resolution-center-cases/request-information-from-the-customer.md) — `POST /resolution_center_cases/{id}/request_info`
- [Resolutioncentercase created](./api-reference/beta/resolution-center-cases/resolutioncentercase-created.md) — Sent when a resolution center case is created
- [Resolutioncentercase decided](./api-reference/beta/resolution-center-cases/resolutioncentercase-decided.md) — Sent when a resolution center case is decided
- [Resolutioncentercase updated](./api-reference/beta/resolution-center-cases/resolutioncentercase-updated.md) — Sent when a resolution center case is updated
- [Retrieve Resolution Center Case Summary](./api-reference/beta/resolution-center-cases/retrieve-resolution-center-case-summary.md) — `GET /resolution_center_cases/summary`
- [Retrieve Resolution Center Case](./api-reference/beta/resolution-center-cases/retrieve-resolution-center-case.md) — `GET /resolution_center_cases/{id}`
- [Withdraw a Case](./api-reference/beta/resolution-center-cases/withdraw-a-case.md) — `POST /resolution_center_cases/{id}/withdraw`
- [Retrieve setup status](./api-reference/beta/setup-intents/retrieve-setup-status.md) — `GET /setup_intents/{setup_intent_id}/status`
- [Update setup return URL](./api-reference/beta/setup-intents/update-setup-return-url.md) — `PATCH /setup_intents/{setup_intent_id}/return_url`
- [Create Shipment](./api-reference/beta/shipments/create-shipment.md) — `POST /shipments`
- [List Shipments](./api-reference/beta/shipments/list-shipments.md) — `GET /shipments`
- [Retrieve Shipment](./api-reference/beta/shipments/retrieve-shipment.md) — `GET /shipments/{id}`
- [Shipment created](./api-reference/beta/shipments/shipment-created.md) — Sent when a shipment is created
- [Shipment updated](./api-reference/beta/shipments/shipment-updated.md) — Sent when a shipment is updated
- [Update Shipment](./api-reference/beta/shipments/update-shipment.md) — `PATCH /shipments/{id}`
- [Connect a Social Account](./api-reference/beta/social-accounts/connect-a-social-account.md) — `POST /social_accounts/connect`
- [Create a Social Account](./api-reference/beta/social-accounts/create-a-social-account.md) — `POST /social_accounts`
- [Delete a Social Account](./api-reference/beta/social-accounts/delete-a-social-account.md) — `DELETE /social_accounts/{id}`
- [List Social Account Lead Forms](./api-reference/beta/social-accounts/list-social-account-lead-forms.md) — `GET /social_accounts/{id}/lead_forms`
- [List Social Account Posts](./api-reference/beta/social-accounts/list-social-account-posts.md) — `GET /social_accounts/{id}/posts`
- [List Social Accounts](./api-reference/beta/social-accounts/list-social-accounts.md) — `GET /social_accounts`
- [Social Account](./api-reference/beta/social-accounts/social-account.md)
- [List Metrics](./api-reference/beta/stats/list-metrics.md) — `GET /stats`
- [Retrieve Metric](./api-reference/beta/stats/retrieve-metric.md) — `GET /stats/{metric}`
- [Stats](./api-reference/beta/stats/stats.md)
- [Create Swap Quote](./api-reference/beta/swaps/create-swap-quote.md) — `POST /swaps/quote`
- [Create Swap](./api-reference/beta/swaps/create-swap.md) — `POST /swaps`
- [List Swaps](./api-reference/beta/swaps/list-swaps.md) — `GET /swaps`
- [Retrieve Swap](./api-reference/beta/swaps/retrieve-swap.md) — `GET /swaps/{id}`
- [Swap completed](./api-reference/beta/swaps/swap-completed.md) — Sent when a swap is completed
- [Swaps](./api-reference/beta/swaps/swap.md)
- [Create Team Member](./api-reference/beta/team-members/create-team-member.md) — `POST /team_members`
- [Delete Team Member](./api-reference/beta/team-members/delete-team-member.md) — `DELETE /team_members/{id}`
- [List Team Members](./api-reference/beta/team-members/list-team-members.md) — `GET /team_members`
- [Retrieve Team Member](./api-reference/beta/team-members/retrieve-team-member.md) — `GET /team_members/{id}`
- [Team Member](./api-reference/beta/team-members/team-member.md)
- [Update Team Member](./api-reference/beta/team-members/update-team-member.md) — `PATCH /team_members/{id}`
- [Create Transfer](./api-reference/beta/transfers/create-transfer.md) — `POST /transfers`
- [List Transfer Recipients](./api-reference/beta/transfers/list-transfer-recipients.md) — `GET /transfers/recipients`
- [List Transfers](./api-reference/beta/transfers/list-transfers.md) — `GET /transfers`
- [Retrieve Transfer](./api-reference/beta/transfers/retrieve-transfer.md) — `GET /transfers/{id}`
- [Transfer completed](./api-reference/beta/transfers/transfer-completed.md) — Sent when a transfer is completed
- [Transfer created](./api-reference/beta/transfers/transfer-created.md) — Sent when a transfer is created
- [Transfer failed](./api-reference/beta/transfers/transfer-failed.md) — Sent when a transfer is failed
- [Transfers](./api-reference/beta/transfers/transfer.md)
- [Authorize an App](./api-reference/beta/users/authorize-an-app.md) — `POST /users/me/oauth_grants`
- [Check User Access](./api-reference/beta/users/check-user-access.md) — `GET /users/{id}/access/{resource_id}`
- [Create Challenge](./api-reference/beta/users/create-challenge.md) — `POST /users/me/passkeys/challenge`
- [Delete](./api-reference/beta/users/delete.md) — `DELETE /users/me/passkeys/{id}`
- [List Experiences](./api-reference/beta/users/list-experiences.md) — `GET /users/me/preferences/notifications/experiences`
- [List OAuth Grants](./api-reference/beta/users/list-oauth-grants.md) — `GET /users/me/oauth_grants`
- [List Recommended Actions](./api-reference/beta/users/list-recommended-actions.md) — `GET /users/{id}/recommend_actions`
- [List Topics](./api-reference/beta/users/list-topics.md) — `GET /users/me/preferences/notifications/topics`
- [List Users](./api-reference/beta/users/list-users.md) — `GET /users`
- [List](./api-reference/beta/users/list.md) — `GET /users/me/passkeys`
- [Register](./api-reference/beta/users/register.md) — `POST /users/me/passkeys`
- [Retrieve User](./api-reference/beta/users/retrieve-user.md) — `GET /users/{id}`
- [Retrieve](./api-reference/beta/users/retrieve.md) — `GET /users/me/preferences`
- [Set](./api-reference/beta/users/set.md) — `PATCH /users/me/preferences/notifications`
- [Update User](./api-reference/beta/users/update-user.md) — `PATCH /users/{id}`
- [Update](./api-reference/beta/users/update.md) — `PATCH /users/me/preferences`
- [User](./api-reference/beta/users/user.md)
- [Create Verification](./api-reference/beta/verifications/create-verification.md) — `POST /verifications`
- [Identityprofile updated](./api-reference/beta/verifications/identityprofile-updated.md) — Sent whenever an identity profile changes state — a verification is approved, needs action, or is rejected, or a Whop review opens or clears. Every ot
- [List Verifications](./api-reference/beta/verifications/list-verifications.md) — `GET /verifications`
- [Retrieve Verification](./api-reference/beta/verifications/retrieve-verification.md) — `GET /verifications/{id}`
- [Update Verification](./api-reference/beta/verifications/update-verification.md) — `PATCH /verifications/{id}`
- [Verification](./api-reference/beta/verifications/verification.md)
- [Create Webhook](./api-reference/beta/webhooks/create-webhook.md) — `POST /webhooks`
- [Delete Webhook](./api-reference/beta/webhooks/delete-webhook.md) — `DELETE /webhooks/{id}`
- [List Deliveries](./api-reference/beta/webhooks/list-deliveries.md) — `GET /webhooks/{id}/deliveries`
- [List Webhooks](./api-reference/beta/webhooks/list-webhooks.md) — `GET /webhooks`
- [Replay Deliveries in a Range](./api-reference/beta/webhooks/replay-deliveries-in-a-range.md) — `POST /webhooks/{id}/replay`
- [Replay Delivery](./api-reference/beta/webhooks/replay-delivery.md) — `POST /webhooks/{id}/deliveries/{delivery_id}/replay`
- [Retrieve Webhook](./api-reference/beta/webhooks/retrieve-webhook.md) — `GET /webhooks/{id}`
- [Send Test Event](./api-reference/beta/webhooks/send-test-event.md) — `POST /webhooks/{id}/test`
- [Update Webhook](./api-reference/beta/webhooks/update-webhook.md) — `PATCH /webhooks/{id}`

### `api-reference/bounties` (4)

- [Create bounty](./api-reference/bounties/create-bounty.md) — `POST /bounties`
- [List bounties](./api-reference/bounties/list-bounties.md) — `GET /bounties`
- [Retrieve bounty](./api-reference/bounties/retrieve-bounty.md) — `GET /bounties/{id}`
- [Workforce Bounty](./api-reference/bounties/workforce-bounty.md) — A privately accessible bounty.

### `api-reference/card-transactions` (8)

- [Card Transaction](./api-reference/card-transactions/card-transaction.md) — A card transaction record.
- [Cardtransaction completed](./api-reference/card-transactions/cardtransaction-completed.md) — Sent when a card transaction is completed
- [Cardtransaction created](./api-reference/card-transactions/cardtransaction-created.md) — Sent when a card transaction is created
- [Cardtransaction declined](./api-reference/card-transactions/cardtransaction-declined.md) — Sent when a card transaction is declined
- [Cardtransaction reversed](./api-reference/card-transactions/cardtransaction-reversed.md) — Sent when a card transaction is reversed
- [Cardtransaction updated](./api-reference/card-transactions/cardtransaction-updated.md) — Sent when a card transaction is updated
- [List card transactions](./api-reference/card-transactions/list-card-transactions.md) — `GET /card_transactions`
- [Retrieve card transaction](./api-reference/card-transactions/retrieve-card-transaction.md) — `GET /card_transactions/{id}`

### `api-reference/chat-channels` (4)

- [Chat Channel](./api-reference/chat-channels/chat-channel.md) — A real-time chat feed attached to an experience, with configurable moderation and posting permissions.
- [List chat channels](./api-reference/chat-channels/list-chat-channels.md) — `GET /chat_channels`
- [Retrieve chat channel](./api-reference/chat-channels/retrieve-chat-channel.md) — `GET /chat_channels/{id}`
- [Update chat channel](./api-reference/chat-channels/update-chat-channel.md) — `PATCH /chat_channels/{id}`

### `api-reference/checkout-configurations` (4)

- [Checkout Configuration](./api-reference/checkout-configurations/checkout-configuration.md) — A checkout configuration is a reusable configuration for a checkout, including the plan, affiliate, and custom metadata. Payments and memberships crea
- [Create checkout configuration](./api-reference/checkout-configurations/create-checkout-configuration.md) — `POST /checkout_configurations`
- [List checkout configurations](./api-reference/checkout-configurations/list-checkout-configurations.md) — `GET /checkout_configurations`
- [Retrieve checkout configuration](./api-reference/checkout-configurations/retrieve-checkout-configuration.md) — `GET /checkout_configurations/{id}`

### `api-reference/companies` (6)

- [Company](./api-reference/companies/company.md) — A company is a seller on Whop. Companies own products, manage members, and receive payouts.
- [Create child company API key](./api-reference/companies/create-child-company-api-key.md) — `POST /companies/{parent_company_id}/api_keys`
- [Create company](./api-reference/companies/create-company.md) — `POST /companies`
- [List companies](./api-reference/companies/list-companies.md) — `GET /companies`
- [Retrieve company](./api-reference/companies/retrieve-company.md) — `GET /companies/{id}`
- [Update company](./api-reference/companies/update-company.md) — `PATCH /companies/{id}`

### `api-reference/company-token-transactions` (4)

- [Company Token Transaction](./api-reference/company-token-transactions/company-token-transaction.md) — A token transaction records a credit or debit to a member's token balance within a company, including transfers between members.
- [Create company token transaction](./api-reference/company-token-transactions/create-company-token-transaction.md) — `POST /company_token_transactions`
- [List company token transactions](./api-reference/company-token-transactions/list-company-token-transactions.md) — `GET /company_token_transactions`
- [Retrieve company token transaction](./api-reference/company-token-transactions/retrieve-company-token-transaction.md) — `GET /company_token_transactions/{id}`

### `api-reference/course-chapters` (6)

- [Course Chapter](./api-reference/course-chapters/course-chapter.md) — A grouping of related lessons within a course, used to organize content into sections.
- [Create course chapter](./api-reference/course-chapters/create-course-chapter.md) — `POST /course_chapters`
- [Delete course chapter](./api-reference/course-chapters/delete-course-chapter.md) — `DELETE /course_chapters/{id}`
- [List course chapters](./api-reference/course-chapters/list-course-chapters.md) — `GET /course_chapters`
- [Retrieve course chapter](./api-reference/course-chapters/retrieve-course-chapter.md) — `GET /course_chapters/{id}`
- [Update course chapter](./api-reference/course-chapters/update-course-chapter.md) — `PATCH /course_chapters/{id}`

### `api-reference/course-lesson-interactions` (4)

- [Course Lesson Interaction](./api-reference/course-lesson-interactions/course-lesson-interaction.md) — A record of a user's progress on a specific lesson, tracking whether they have completed it.
- [Courselessoninteraction completed](./api-reference/course-lesson-interactions/courselessoninteraction-completed.md) — Sent when a course lesson interaction is completed
- [List course lesson interactions](./api-reference/course-lesson-interactions/list-course-lesson-interactions.md) — `GET /course_lesson_interactions`
- [Retrieve course lesson interaction](./api-reference/course-lesson-interactions/retrieve-course-lesson-interaction.md) — `GET /course_lesson_interactions/{id}`

### `api-reference/course-lessons` (9)

- [Course Lesson](./api-reference/course-lessons/course-lesson.md) — An individual learning unit within a chapter, which can contain text, video, PDF, or assessment content.
- [Create course lesson](./api-reference/course-lessons/create-course-lesson.md) — `POST /course_lessons`
- [Delete course lesson](./api-reference/course-lessons/delete-course-lesson.md) — `DELETE /course_lessons/{id}`
- [List course lessons](./api-reference/course-lessons/list-course-lessons.md) — `GET /course_lessons`
- [Mark as completed course lesson](./api-reference/course-lessons/mark-as-completed-course-lesson.md) — `POST /course_lessons/{lesson_id}/mark_as_completed`
- [Retrieve course lesson](./api-reference/course-lessons/retrieve-course-lesson.md) — `GET /course_lessons/{id}`
- [Start course lesson](./api-reference/course-lessons/start-course-lesson.md) — `POST /course_lessons/{lesson_id}/start`
- [Submit assessment course lesson](./api-reference/course-lessons/submit-assessment-course-lesson.md) — `POST /course_lessons/{lesson_id}/submit_assessment`
- [Update course lesson](./api-reference/course-lessons/update-course-lesson.md) — `PATCH /course_lessons/{id}`

### `api-reference/course-students` (3)

- [Course Student](./api-reference/course-students/course-student.md) — An enrollment record for a student in a course, including progress and completion metrics.
- [List course students](./api-reference/course-students/list-course-students.md) — `GET /course_students`
- [Retrieve course student](./api-reference/course-students/retrieve-course-student.md) — `GET /course_students/{id}`

### `api-reference/courses` (6)

- [Course](./api-reference/courses/course.md) — A structured learning module containing chapters and lessons, belonging to an experience.
- [Create course](./api-reference/courses/create-course.md) — `POST /courses`
- [Delete course](./api-reference/courses/delete-course.md) — `DELETE /courses/{id}`
- [List courses](./api-reference/courses/list-courses.md) — `GET /courses`
- [Retrieve course](./api-reference/courses/retrieve-course.md) — `GET /courses/{id}`
- [Update course](./api-reference/courses/update-course.md) — `PATCH /courses/{id}`

### `api-reference/dispute-alerts` (4)

- [Dispute alert created](./api-reference/dispute-alerts/dispute-alert-created.md) — Sent when a dispute alert is created
- [Dispute Alert](./api-reference/dispute-alerts/dispute-alert.md) — A dispute alert represents an early warning notification from a payment processor about a potential dispute or chargeback.
- [List dispute alerts](./api-reference/dispute-alerts/list-dispute-alerts.md) — `GET /dispute_alerts`
- [Retrieve dispute alert](./api-reference/dispute-alerts/retrieve-dispute-alert.md) — `GET /dispute_alerts/{id}`

### `api-reference/disputes` (7)

- [Dispute created](./api-reference/disputes/dispute-created.md) — Sent when a dispute is created
- [Dispute updated](./api-reference/disputes/dispute-updated.md) — Sent when a dispute is updated
- [Dispute](./api-reference/disputes/dispute.md) — A dispute is a chargeback or payment challenge filed against a company, including evidence and response status.
- [List disputes](./api-reference/disputes/list-disputes.md) — `GET /disputes`
- [Retrieve dispute](./api-reference/disputes/retrieve-dispute.md) — `GET /disputes/{id}`
- [Submit evidence](./api-reference/disputes/submit-evidence.md) — `POST /disputes/{id}/submit_evidence`
- [Update evidence](./api-reference/disputes/update-evidence.md) — `POST /disputes/{id}/update_evidence`

### `api-reference/dm-channels` (6)

- [Create dm channel](./api-reference/dm-channels/create-dm-channel.md) — `POST /dm_channels`
- [Delete dm channel](./api-reference/dm-channels/delete-dm-channel.md) — `DELETE /dm_channels/{id}`
- [Dm Channel](./api-reference/dm-channels/dm-channel.md) — A messaging channel that can be a one-on-one DM, group chat, company support conversation, or platform-level direct message.
- [List dm channels](./api-reference/dm-channels/list-dm-channels.md) — `GET /dm_channels`
- [Retrieve dm channel](./api-reference/dm-channels/retrieve-dm-channel.md) — `GET /dm_channels/{id}`
- [Update dm channel](./api-reference/dm-channels/update-dm-channel.md) — `PATCH /dm_channels/{id}`

### `api-reference/dm-members` (6)

- [Create dm member](./api-reference/dm-members/create-dm-member.md) — `POST /dm_members`
- [Delete dm member](./api-reference/dm-members/delete-dm-member.md) — `DELETE /dm_members/{id}`
- [Dm Member](./api-reference/dm-members/dm-member.md) — A user's membership record in a messaging channel, including notification preferences and read state.
- [List dm members](./api-reference/dm-members/list-dm-members.md) — `GET /dm_members`
- [Retrieve dm member](./api-reference/dm-members/retrieve-dm-member.md) — `GET /dm_members/{id}`
- [Update dm member](./api-reference/dm-members/update-dm-member.md) — `PATCH /dm_members/{id}`

### `api-reference/entries` (9)

- [Approve entry](./api-reference/entries/approve-entry.md) — `POST /entries/{id}/approve`
- [Deny entry](./api-reference/entries/deny-entry.md) — `POST /entries/{id}/deny`
- [Entry approved](./api-reference/entries/entry-approved.md) — Sent when a entry is approved
- [Entry created](./api-reference/entries/entry-created.md) — Sent when a entry is created
- [Entry deleted](./api-reference/entries/entry-deleted.md) — Sent when a entry is deleted
- [Entry denied](./api-reference/entries/entry-denied.md) — Sent when a entry is denied
- [Entry](./api-reference/entries/entry.md) — An entry represents a user's signup for a waitlisted plan.
- [List entries](./api-reference/entries/list-entries.md) — `GET /entries`
- [Retrieve entry](./api-reference/entries/retrieve-entry.md) — `GET /entries/{id}`

### `api-reference/experiences` (9)

- [Attach experience](./api-reference/experiences/attach-experience.md) — `POST /experiences/{id}/attach`
- [Create experience](./api-reference/experiences/create-experience.md) — `POST /experiences`
- [Delete experience](./api-reference/experiences/delete-experience.md) — `DELETE /experiences/{id}`
- [Detach experience](./api-reference/experiences/detach-experience.md) — `POST /experiences/{id}/detach`
- [Duplicate experience](./api-reference/experiences/duplicate-experience.md) — `POST /experiences/{id}/duplicate`
- [Experience](./api-reference/experiences/experience.md) — An experience is a feature or content module within a product, such as a chat, course, or custom app.
- [List experiences](./api-reference/experiences/list-experiences.md) — `GET /experiences`
- [Retrieve experience](./api-reference/experiences/retrieve-experience.md) — `GET /experiences/{id}`
- [Update experience](./api-reference/experiences/update-experience.md) — `PATCH /experiences/{id}`

### `api-reference/fee-markups` (4)

- [Create fee markup](./api-reference/fee-markups/create-fee-markup.md) — `POST /fee_markups`
- [Delete fee markup](./api-reference/fee-markups/delete-fee-markup.md) — `DELETE /fee_markups/{id}`
- [Fee Markup](./api-reference/fee-markups/fee-markup.md) — A fee markup configuration that defines additional charges applied to transactions for a platform's connected accounts.
- [List fee markups](./api-reference/fee-markups/list-fee-markups.md) — `GET /fee_markups`

### `api-reference/files` (3)

- [Create file](./api-reference/files/create-file.md) — `POST /files`
- [File](./api-reference/files/file.md) — A file that has been uploaded or is pending upload.
- [Retrieve file](./api-reference/files/retrieve-file.md) — `GET /files/{id}`

### `api-reference/forum-posts` (5)

- [Create forum post](./api-reference/forum-posts/create-forum-post.md) — `POST /forum_posts`
- [Forum Post](./api-reference/forum-posts/forum-post.md) — A post or comment in a forum feed, supporting rich text, attachments, polls, and reactions.
- [List forum posts](./api-reference/forum-posts/list-forum-posts.md) — `GET /forum_posts`
- [Retrieve forum post](./api-reference/forum-posts/retrieve-forum-post.md) — `GET /forum_posts/{id}`
- [Update forum post](./api-reference/forum-posts/update-forum-post.md) — `PATCH /forum_posts/{id}`

### `api-reference/forums` (4)

- [Forum](./api-reference/forums/forum.md) — A discussion forum where members can create posts, comment, and react, belonging to an experience.
- [List forums](./api-reference/forums/list-forums.md) — `GET /forums`
- [Retrieve forum](./api-reference/forums/retrieve-forum.md) — `GET /forums/{id}`
- [Update forum](./api-reference/forums/update-forum.md) — `PATCH /forums/{id}`

### `api-reference/identity-profiles` (6)

- [Identity Profile](./api-reference/identity-profiles/identity-profile.md) — A consolidated identity or business profile synced from verification provider data.
- [Identityprofile updated](./api-reference/identity-profiles/identityprofile-updated.md) — Sent whenever an identity profile changes state — a verification is approved, needs action, or is rejected, or a Whop review opens or clears. Every ot
- [List identity profile verifications](./api-reference/identity-profiles/list-identity-profile-verifications.md) — `GET /identity_profiles/{id}/verifications`
- [List identity profiles](./api-reference/identity-profiles/list-identity-profiles.md) — `GET /identity_profiles`
- [Retrieve identity profile](./api-reference/identity-profiles/retrieve-identity-profile.md) — `GET /identity_profiles/{id}`
- [Unlink an identity profile](./api-reference/identity-profiles/unlink-an-identity-profile.md) — `DELETE /identity_profiles/{id}`

### `api-reference/invoices` (15)

- [Create invoice](./api-reference/invoices/create-invoice.md) — `POST /invoices`
- [Delete invoice](./api-reference/invoices/delete-invoice.md) — `DELETE /invoices/{id}`
- [Invoice created](./api-reference/invoices/invoice-created.md) — Sent when a invoice is created
- [Invoice marked uncollectible](./api-reference/invoices/invoice-marked-uncollectible.md) — Sent when a invoice is marked uncollectible
- [Invoice paid](./api-reference/invoices/invoice-paid.md) — Sent when a invoice is paid
- [Invoice past due](./api-reference/invoices/invoice-past-due.md) — Sent when a invoice is past due
- [Invoice voided](./api-reference/invoices/invoice-voided.md) — Sent when a invoice is voided
- [Invoice](./api-reference/invoices/invoice.md) — An invoice represents an itemized bill sent by a company to a customer for a specific product and plan, tracking the amount owed, due date, and paymen
- [List invoices](./api-reference/invoices/list-invoices.md) — `GET /invoices`
- [Mark paid invoice](./api-reference/invoices/mark-paid-invoice.md) — `POST /invoices/{id}/mark_paid`
- [Mark uncollectible invoice](./api-reference/invoices/mark-uncollectible-invoice.md) — `POST /invoices/{id}/mark_uncollectible`
- [Resend invoice](./api-reference/invoices/resend-invoice.md) — `POST /invoices/{id}/resend`
- [Retrieve invoice](./api-reference/invoices/retrieve-invoice.md) — `GET /invoices/{id}`
- [Update invoice](./api-reference/invoices/update-invoice.md) — `PATCH /invoices/{id}`
- [Void invoice](./api-reference/invoices/void-invoice.md) — `POST /invoices/{id}/void`

### `api-reference/leads` (5)

- [Create lead](./api-reference/leads/create-lead.md) — `POST /leads`
- [Lead](./api-reference/leads/lead.md) — A prospective customer who has expressed interest in a company or product but has not yet purchased.
- [List leads](./api-reference/leads/list-leads.md) — `GET /leads`
- [Retrieve lead](./api-reference/leads/retrieve-lead.md) — `GET /leads/{id}`
- [Update lead](./api-reference/leads/update-lead.md) — `PATCH /leads/{id}`

### `api-reference/ledger-accounts` (3)

- [Ledger Account](./api-reference/ledger-accounts/ledger-account.md) — A ledger account represents a financial account on Whop that can hold many balances.
- [Ledgeraccount funds available](./api-reference/ledger-accounts/ledgeraccount-funds-available.md) — Sent when a ledger account is funds available
- [Retrieve ledger account](./api-reference/ledger-accounts/retrieve-ledger-account.md) — `GET /ledger_accounts/{id}`

### `api-reference/members` (4)

- [List members](./api-reference/members/list-members.md) — `GET /members`
- [Member created](./api-reference/members/member-created.md) — Sent when a member is created
- [Member](./api-reference/members/member.md) — A member represents a user's relationship with a company on Whop, including their access level, status, and spending history.
- [Retrieve member](./api-reference/members/retrieve-member.md) — `GET /members/{id}`

### `api-reference/memberships` (14)

- [Add free days membership](./api-reference/memberships/add-free-days-membership.md) — `POST /memberships/{id}/add_free_days`
- [Cancel membership](./api-reference/memberships/cancel-membership.md) — `POST /memberships/{id}/cancel`
- [List memberships](./api-reference/memberships/list-memberships.md) — `GET /memberships`
- [Membership activated](./api-reference/memberships/membership-activated.md) — Sent when a membership is activated
- [Membership cancel at period end changed](./api-reference/memberships/membership-cancel-at-period-end-changed.md) — Sent when a membership is cancel at period end changed
- [Membership deactivated](./api-reference/memberships/membership-deactivated.md) — Sent when a membership is deactivated
- [Membership trial ending soon](./api-reference/memberships/membership-trial-ending-soon.md) — Sent when a membership is trial ending soon
- [Membership](./api-reference/memberships/membership.md) — A membership represents an active relationship between a user and a product. It tracks the user's access, billing status, and renewal schedule.
- [Pause membership](./api-reference/memberships/pause-membership.md) — `POST /memberships/{id}/pause`
- [Resume membership](./api-reference/memberships/resume-membership.md) — `POST /memberships/{id}/resume`
- [Resync access membership](./api-reference/memberships/resync-access-membership.md) — `POST /memberships/{id}/resync_access`
- [Retrieve membership](./api-reference/memberships/retrieve-membership.md) — `GET /memberships/{id}`
- [Uncancel membership](./api-reference/memberships/uncancel-membership.md) — `POST /memberships/{id}/uncancel`
- [Update membership](./api-reference/memberships/update-membership.md) — `PATCH /memberships/{id}`

### `api-reference/messages` (7)

- [Chat message created](./api-reference/messages/chat-message-created.md) — Sent when a chat event is created
- [Create message](./api-reference/messages/create-message.md) — `POST /messages`
- [Delete message](./api-reference/messages/delete-message.md) — `DELETE /messages/{id}`
- [List messages](./api-reference/messages/list-messages.md) — `GET /messages`
- [Message](./api-reference/messages/message.md) — A message sent within an experience chat, direct message, or group chat.
- [Retrieve message](./api-reference/messages/retrieve-message.md) — `GET /messages/{id}`
- [Update message](./api-reference/messages/update-message.md) — `PATCH /messages/{id}`

### `api-reference/notifications` (1)

- [Create notification](./api-reference/notifications/create-notification.md) — `POST /notifications`

### `api-reference/payment-methods` (4)

- [Delete payment method](./api-reference/payment-methods/delete-payment-method.md) — `DELETE /payment_methods/{id}`
- [List payment methods](./api-reference/payment-methods/list-payment-methods.md) — `GET /payment_methods`
- [Payment Method](./api-reference/payment-methods/payment-method.md)
- [Retrieve payment method](./api-reference/payment-methods/retrieve-payment-method.md) — `GET /payment_methods/{id}`

### `api-reference/payments` (14)

- [Create payment](./api-reference/payments/create-payment.md) — `POST /payments`
- [List fees](./api-reference/payments/list-fees.md) — `GET /payments/{id}/fees`
- [List payments](./api-reference/payments/list-payments.md) — `GET /payments`
- [Payment authorized](./api-reference/payments/payment-authorized.md) — Sent when a payment is authorized
- [Payment canceled](./api-reference/payments/payment-canceled.md) — Sent when a payment is canceled
- [Payment created](./api-reference/payments/payment-created.md) — Sent when a payment is created
- [Payment failed](./api-reference/payments/payment-failed.md) — Sent when a payment is failed
- [Payment pending](./api-reference/payments/payment-pending.md) — Sent when a payment is pending
- [Payment succeeded](./api-reference/payments/payment-succeeded.md) — Sent when a payment is succeeded
- [Payment](./api-reference/payments/payment.md) — A payment represents a completed or attempted charge. Payments track the amount, status, currency, and payment method used.
- [Refund payment](./api-reference/payments/refund-payment.md) — `POST /payments/{id}/refund`
- [Retrieve payment](./api-reference/payments/retrieve-payment.md) — `GET /payments/{id}`
- [Retry payment](./api-reference/payments/retry-payment.md) — `POST /payments/{id}/retry`
- [Void payment](./api-reference/payments/void-payment.md) — `POST /payments/{id}/void`

### `api-reference/payout-accounts` (3)

- [Payout Account](./api-reference/payout-accounts/payout-account.md) — An object representing an account used for payouts.
- [Payoutaccount status updated](./api-reference/payout-accounts/payoutaccount-status-updated.md) — Sent when a payout account is status updated
- [Retrieve payout account](./api-reference/payout-accounts/retrieve-payout-account.md) — `GET /payout_accounts/{id}`

### `api-reference/payout-methods` (4)

- [List payout methods](./api-reference/payout-methods/list-payout-methods.md) — `GET /payout_methods`
- [Payout Method](./api-reference/payout-methods/payout-method.md) — A configured payout destination where a user receives earned funds, such as a bank account or digital wallet.
- [Payoutmethod created](./api-reference/payout-methods/payoutmethod-created.md) — Sent when a payout method is created
- [Retrieve payout method](./api-reference/payout-methods/retrieve-payout-method.md) — `GET /payout_methods/{id}`

### `api-reference/plans` (1)

- [Plans](./api-reference/plans/plan.md) — The Plans API is documented in the Whop API reference.

### `api-reference/products` (11)

- [Create product](./api-reference/products/create-product.md) — `POST /products`
- [Delete product](./api-reference/products/delete-product.md) — `DELETE /products/{id}`
- [List products](./api-reference/products/list-products.md) — `GET /products`
- [Product created](./api-reference/products/product-created.md) — Sent when a product is created
- [Product deleted](./api-reference/products/product-deleted.md) — Sent when a product is deleted
- [Product published](./api-reference/products/product-published.md) — Sent when a product is published
- [Product unpublished](./api-reference/products/product-unpublished.md) — Sent when a product is unpublished
- [Product updated](./api-reference/products/product-updated.md) — Sent when a product is updated
- [Product](./api-reference/products/product.md) — A product is a digital good or service sold on Whop. Products contain plans for pricing and experiences for content delivery.
- [Retrieve product](./api-reference/products/retrieve-product.md) — `GET /products/{id}`
- [Update product](./api-reference/products/update-product.md) — `PATCH /products/{id}`

### `api-reference/promo-codes` (6)

- [Create promo code](./api-reference/promo-codes/create-promo-code.md) — `POST /promo_codes`
- [Delete promo code](./api-reference/promo-codes/delete-promo-code.md) — `DELETE /promo_codes/{id}`
- [List promo codes](./api-reference/promo-codes/list-promo-codes.md) — `GET /promo_codes`
- [Promo Code](./api-reference/promo-codes/promo-code.md) — A promo code applies a discount to a plan during checkout. Promo codes can be percentage-based or fixed-amount, and can have usage limits and expirati
- [Retrieve promo code](./api-reference/promo-codes/retrieve-promo-code.md) — `GET /promo_codes/{id}`
- [Update promo code](./api-reference/promo-codes/update-promo-code.md) — `PATCH /promo_codes/{id}`

### `api-reference/reactions` (6)

- [Chat reaction created](./api-reference/reactions/chat-reaction-created.md) — Sent when a chat event is created
- [Create reaction](./api-reference/reactions/create-reaction.md) — `POST /reactions`
- [Delete reaction](./api-reference/reactions/delete-reaction.md) — `DELETE /reactions/{id}`
- [List reactions](./api-reference/reactions/list-reactions.md) — `GET /reactions`
- [Reaction](./api-reference/reactions/reaction.md) — A single reaction left by a user on a feed post, such as a like or emoji.
- [Retrieve reaction](./api-reference/reactions/retrieve-reaction.md) — `GET /reactions/{id}`

### `api-reference/refunds` (5)

- [List refunds](./api-reference/refunds/list-refunds.md) — `GET /refunds`
- [Refund created](./api-reference/refunds/refund-created.md) — Sent when a refund is created
- [Refund updated](./api-reference/refunds/refund-updated.md) — Sent when a refund is updated
- [Refund](./api-reference/refunds/refund.md) — A refund represents a full or partial reversal of a payment, including the amount, status, and payment provider.
- [Retrieve refund](./api-reference/refunds/retrieve-refund.md) — `GET /refunds/{id}`

### `api-reference/resolution-center-cases` (6)

- [List resolution center cases](./api-reference/resolution-center-cases/list-resolution-center-cases.md) — `GET /resolution_center_cases`
- [Resolution Center Case](./api-reference/resolution-center-cases/resolution-center-case.md) — A resolution center case is a dispute or support case between a user and a company, tracking the issue, status, and outcome.
- [Resolutioncentercase created](./api-reference/resolution-center-cases/resolutioncentercase-created.md) — Sent when a resolution center case is created
- [Resolutioncentercase decided](./api-reference/resolution-center-cases/resolutioncentercase-decided.md) — Sent when a resolution center case is decided
- [Resolutioncentercase updated](./api-reference/resolution-center-cases/resolutioncentercase-updated.md) — Sent when a resolution center case is updated
- [Retrieve resolution center case](./api-reference/resolution-center-cases/retrieve-resolution-center-case.md) — `GET /resolution_center_cases/{id}`

### `api-reference/reviews` (3)

- [List reviews](./api-reference/reviews/list-reviews.md) — `GET /reviews`
- [Retrieve review](./api-reference/reviews/retrieve-review.md) — `GET /reviews/{id}`
- [Review](./api-reference/reviews/review.md) — A user-submitted review of a company, including a star rating and optional text feedback.

### `api-reference/setup-intents` (7)

- [Setup Intent](./api-reference/setup-intents/create-setup-intent.md) — A setup intent allows a user to save a payment method for future use without making an immediate purchase.
- [List setup intents](./api-reference/setup-intents/list-setup-intents.md) — `GET /setup_intents`
- [Retrieve setup intent](./api-reference/setup-intents/retrieve-setup-intent.md) — `GET /setup_intents/{id}`
- [Setup Intent](./api-reference/setup-intents/setup-intent.md) — A setup intent allows a user to save a payment method for future use without making an immediate purchase.
- [Setupintent canceled](./api-reference/setup-intents/setupintent-canceled.md) — Sent when a setup intent is canceled
- [Setupintent requires action](./api-reference/setup-intents/setupintent-requires-action.md) — Sent when a setup intent is requires action
- [Setupintent succeeded](./api-reference/setup-intents/setupintent-succeeded.md) — Sent when a setup intent is succeeded

### `api-reference/shipments` (6)

- [Create shipment](./api-reference/shipments/create-shipment.md) — `POST /shipments`
- [List shipments](./api-reference/shipments/list-shipments.md) — `GET /shipments`
- [Retrieve shipment](./api-reference/shipments/retrieve-shipment.md) — `GET /shipments/{id}`
- [Shipment created](./api-reference/shipments/shipment-created.md) — Sent when a shipment is created
- [Shipment updated](./api-reference/shipments/shipment-updated.md) — Sent when a shipment is updated
- [Shipment](./api-reference/shipments/shipment.md) — A physical shipment associated with a payment, including carrier details and tracking information.

### `api-reference/stats` (3)

- [Describe stats](./api-reference/stats/describe-stats.md) — `GET /stats/describe`
- [Metric stats](./api-reference/stats/metric-stats.md) — `GET /stats/metric`
- [Raw stats](./api-reference/stats/raw-stats.md) — `GET /stats/raw`

### `api-reference/support-channels` (4)

- [Create support channel](./api-reference/support-channels/create-support-channel.md) — `POST /support_channels`
- [List support channels](./api-reference/support-channels/list-support-channels.md) — `GET /support_channels`
- [Retrieve support channel](./api-reference/support-channels/retrieve-support-channel.md) — `GET /support_channels/{id}`
- [Support Channel](./api-reference/support-channels/support-channel.md) — A messaging channel that can be a one-on-one DM, group chat, company support conversation, or platform-level direct message.

### `api-reference/topups` (2)

- [Create topup](./api-reference/topups/create-topup.md) — `POST /topups`
- [Topup](./api-reference/topups/topup.md) — A payment represents a completed or attempted charge. Payments track the amount, status, currency, and payment method used.

### `api-reference/transfers` (1)

- [Transfers](./api-reference/transfers/transfer.md) — The Transfers API is documented in the Whop API reference.

### `api-reference/users` (1)

- [Users](./api-reference/users/user.md) — The Users API is documented in the Whop API reference.

### `api-reference/verifications` (4)

- [List verifications](./api-reference/verifications/list-verifications.md) — `GET /verifications`
- [Retrieve verification](./api-reference/verifications/retrieve-verification.md) — `GET /verifications/{id}`
- [Verification succeeded](./api-reference/verifications/verification-succeeded.md) — Sent when a verification is succeeded
- [Verification](./api-reference/verifications/verification.md) — An identity verification session used to confirm a person or entity's identity for payout account eligibility.

### `api-reference/webhooks` (8)

- [Create webhook](./api-reference/webhooks/create-webhook.md) — `POST /webhooks`
- [Delete webhook](./api-reference/webhooks/delete-webhook.md) — `DELETE /webhooks/{id}`
- [List deliveries](./api-reference/webhooks/list-deliveries.md) — `GET /webhooks/{webhook_id}/deliveries`
- [List webhooks](./api-reference/webhooks/list-webhooks.md) — `GET /webhooks`
- [Retrieve webhook](./api-reference/webhooks/retrieve-webhook.md) — `GET /webhooks/{id}`
- [Send test event](./api-reference/webhooks/send-test-event.md) — `POST /webhooks/{id}/test`
- [Update webhook](./api-reference/webhooks/update-webhook.md) — `PATCH /webhooks/{id}`
- [Webhook](./api-reference/webhooks/webhook.md) — A webhook endpoint that receives event notifications for a company via HTTP POST.

### `developer/api` (4)

- [Getting started](./developer/api/getting-started.md) — Start programmatically accepting payments, paying other people, and building businesses.
- [Idempotent requests](./developer/api/idempotency.md) — Retry POST requests with an idempotency key, so a request is never executed twice.
- [Quickstart](./developer/api/quickstart.md) — Create your Whop account, find the dashboard, get an API key, make your first SDK call, and test a webhook.
- [API versions](./developer/api/versioning.md) — Pin your requests to a dated API version so changes to the API never break your integration.

### `developer/cli` (1)

- [CLI](./developer/cli.md) — Install the Whop CLI, sign in, and choose or create the business you want to manage from your terminal.

### `developer/concepts` (1)

- [Core concepts](./developer/concepts.md) — The account model, connected accounts, and how money moves through Whop.

### `developer/guides` (44)

- [Accept payments](./developer/guides/accept-payments.md) — Accept one-time and recurring payments across 195 countries with 100+ payment methods
- [Affiliates](./developer/guides/affiliates.md) — Create affiliate records, assign per-plan or rev-share commission overrides, and track referral earnings.
- [AI and MCP](./developer/guides/ai_and_mcp.md) — Connect AI agents to Whop's docs and API with Model Context Protocol servers, an LLM page index, and raw Markdown pages.
- [App Views](./developer/guides/app-views.md) — Configure how and where your app appears on Whop
- [Authentication](./developer/guides/authentication.md) — Verify the current user and check their access level inside your Whop app.
- [Chat](./developer/guides/chat.md) — Send messages, manage channels, and react to events in any Whop community.
- [Authentication](./developer/guides/chat/authentication.md) — Authenticate users for embedded chat with account-scoped tokens or OAuth
- [Channels](./developer/guides/chat/channels.md) — Use channels for shared chat rooms connected to products and memberships
- [Chat element](./developer/guides/chat/chat-element.md) — Display a chat in your app
- [Direct messages](./developer/guides/chat/direct-messages.md) — Use DMs for private and group conversations between users
- [DMs list element](./developer/guides/chat/dms-list-element.md) — Display a list of direct message conversations
- [OAuth](./developer/guides/chat/oauth.md) — Authenticate embedded chat users with Whop OAuth and SDK-managed sign-in.
- [Playground](./developer/guides/chat/playground.md) — Interactive playground for embedded chat components
- [Quickstart](./developer/guides/chat/quickstart.md) — Give your users a real-time messaging chat on web and native iOS. Support many types of conversations. Whop handles the messages, real-time updates, m
- [Support chats](./developer/guides/chat/support-chats.md) — Use support chats for one-on-one customer support conversations with your account
- [Sync your users](./developer/guides/chat/sync-users.md) — Create or map Whop users with your own platform users.
- [Theming & styles](./developer/guides/chat/theming-and-styles.md) — Customize the appearance of chat elements
- [Development Proxy](./developer/guides/dev-proxy.md) — Run the Whop development proxy to replicate production authentication and iframe behavior during development.
- [Upload files directly](./developer/guides/direct-file-uploads.md) — Upload files to Whop storage with presigned single-part and multipart uploads
- [Example integration](./developer/guides/example-integration.md) — Build a marketplace on top of Whop's global payment and payout rails.
- [Forums](./developer/guides/forums.md) — Create forum posts, fetch threads, and add comments or reactions inside any Whop community.
- [Frosted UI](./developer/guides/frosted_ui.md) — Use Whop's UI kit and Tailwind design system.
- [Iframe SDK](./developer/guides/iframe.md) — Interact with the whop website from within your app.
- [Accept one-time payments](./developer/guides/ios/accept-one-time-payments.md) — Sell physical goods and real-world services with native Apple Pay through Whop (2.7% + $0.30 fees)
- [Build a Paywall](./developer/guides/ios/build-a-paywall.md) — Display subscription plans and handle purchases in your iOS app
- [Check Entitlements](./developer/guides/ios/check-entitlements.md) — Verify subscription status and gate premium content in your iOS app
- [API Reference](./developer/guides/ios/checkout-reference.md) — Complete API documentation for WhopCheckout
- [Installation](./developer/guides/ios/installation.md) — Install the WhopCheckout SDK and configure it with an iap:read API key
- [iOS Checkout SDK](./developer/guides/ios/overview.md) — Sell in-app purchases and subscriptions natively on iOS (2.7% + $0.30 vs Apple's 15-30%)
- [Wallet Stats API](./developer/guides/ledger-stats.md) — Query aggregated financial time-series from your Fragment ledger
- [Memberships](./developer/guides/memberships.md) — Manage subscription lifecycle. Pause, resume, cancel, restore, and add free days.
- [Push notifications](./developer/guides/notifications.md) — Send push notifications to users in your app, scoped by experience or account.
- [OAuth](./developer/guides/oauth.md) — Add "Sign in with Whop" to your site with OAuth 2.1 and Proof Key for Code Exchange (PKCE).
- [Permissions](./developer/guides/permissions.md) — Configure the permissions your app needs and request approval from the creators who install it.
- [Install the Whop pixel](./developer/guides/pixel.md) — Add the whop.track snippet to your funnel to measure page views, identify visitors, and attribute conversions from first-party data.
- [Claude Code](./developer/guides/plugins/claude-code.md) — Install the Whop plugin for Claude Code to run your business from the terminal — products, checkout, payments, payouts, ads, and stats.
- [Grok](./developer/guides/plugins/grok.md) — Install the Whop plugin for Grok Build to run your business from the terminal — products, checkout, payments, payouts, ads, and stats.
- [React Native](./developer/guides/react-native.md) — Build cross-platform mobile and web apps for Whop using React Native.
- [Refunds and disputes](./developer/guides/refunds-and-disputes.md) — Issue refunds, respond to disputes with evidence, and listen for chargeback events.
- [Test in sandbox](./developer/guides/sandbox.md) — Test your integration in a safe environment before going live
- [Save payment methods](./developer/guides/save-payment-methods.md) — Save customer payment methods to charge them later
- [Stats API](./developer/guides/stats.md) — Explore and query analytics data for your account
- [Upload files](./developer/guides/upload-files.md) — Upload images and files for use across the Whop platform
- [Webhooks](./developer/guides/webhooks.md) — Receive payment, membership, and event notifications from Whop in realtime.

### `developer/platforms` (7)

- [Add funds to your balance](./developer/platforms/add-funds-to-your-balance.md) — Top up your platform balance to pay out connected accounts
- [Collect payments for connected accounts](./developer/platforms/collect-payments-for-connected-accounts.md) — Direct charges and transfers for connected accounts
- [Enroll connected accounts](./developer/platforms/enroll-connected-accounts.md) — Onboard businesses or individuals to your platform and facilitate payments
- [Manual payouts to connected accounts](./developer/platforms/manual-payouts.md) — Onboard connected accounts and programmatically pay them out
- [Playground](./developer/platforms/playground.md) — Interactive playground for embedded payout components
- [Quickstart](./developer/platforms/quickstart.md) — Embed payout components in your application in minutes
- [Enable connected account payouts](./developer/platforms/render-payout-portal.md) — Let your connected accounts manage their own payouts through an embedded or hosted portal

### `developer/start` (1)

- [Choose your integration](./developer/start.md) — Pick the path for what you're building and jump straight to the right guide.

### `developer/troubleshooting` (1)

- [Troubleshooting](./developer/troubleshooting.md) — Fix common Whop API, OAuth, checkout, webhook, and embedded element errors.

### `developer/verification` (6)

- [Business structures](./developer/verification/business-structures.md) — business_structure values by country of incorporation.
- [Identity documents](./developer/verification/identity-documents.md) — Which identity documents the API accepts, and the exact file keys to send for each.
- [Update & delete](./developer/verification/manage.md) — Update identity fields before verification, or remove a verification entirely.
- [Verification](./developer/verification/overview.md) — Verify your users' identities before they can receive payouts. One API call starts Know Your Customer (KYC) verification, and Whop handles everything 
- [Check status](./developer/verification/retrieve.md) — List verifications for an account and read verified identity data.
- [Handle RFIs](./developer/verification/rfis.md) — Respond when Whop needs more information — a document, tax ID, or business detail.

### `developer/websites` (5)

- [Blueprints](./developer/websites/blueprints.md) — Deploy a working Whop business — products, pricing, and a live website — in one step, or clone its code with the CLI.
- [Hosting](./developer/websites/hosting.md) — What Whop runs when someone visits your site: builds and rollbacks, app secrets, automatic API authentication, and server logs.
- [Websites](./developer/websites/overview.md) — Ship a fully hosted website on Whop — served at your own whop.site address, versioned on every deploy, and wired to payments and analytics.
- [Build a website with the CLI](./developer/websites/quickstart.md) — Scaffold a Vite app, run it locally against real Whop data, and deploy it to your own whop.site address.
- [Track visitors](./developer/websites/tracking.md) — Every site on whop.site ships the Whop pixel already installed. Page views and checkout events are automatic; add whop.track calls for the funnel step

### `elements/beta` (39)

- [BillingSetupElement](./elements/beta/ads/billing-setup.md) — Which payment methods ad spend bills against: a primary used first, and an optional backup for when it fails. Both are chosen from the methods already
- [CampaignCreatorElement](./elements/beta/ads/campaign-creator.md) — The advertising campaign builder: objective and budget, ad groups with their targeting and schedule, and the ads themselves with their creative — the 
- [Ads](./elements/beta/ads/overview.md) — An advertising account. Scope it to a Whop account with `accountId` — the ad account underneath is assigned server-side and never surfaces here — then
- [ChartElement](./elements/beta/ads/reporting-chart.md) — An account’s performance over a window, with a picker for what to plot — spend, impressions, clicks, or any conversion the account records. Read-only.
- [TableElement](./elements/beta/ads/reporting-table.md) — An advertising account's campaigns, ad groups, and ads in one table, with the tabs that move between them: pick rows to narrow the level below, search
- [Reporting](./elements/beta/ads/reporting.md) — An advertising account's reporting: what it spent and what came back, over a window, at whatever level you narrow to. Mount `chart`, `table`, or both 
- [Appearance](./elements/beta/appearance.md) — Theme, CSS variables, and per-part styling for every element.
- [CheckoutElement](./elements/beta/checkout/checkout.md) — The full checkout surface — order summary with the live quote, promo code entry, the currency the buyer pays in, everything this checkout has to colle
- [ExpressCheckoutElement](./elements/beta/checkout/expressCheckout.md) — One-press Apple Pay and Google Pay buttons for a checkout — the OS payment sheet collects whatever the session still needs (the buyer's email, a shipp
- [Checkout](./elements/beta/checkout/overview.md) — Drives a full hosted checkout for one plan — price summary, promo codes, the currency the buyer pays in, and the whole payment collection surface (the
- [Getting started](./elements/beta/getting-started.md) — Install Whop Elements and mount your first element in React, JavaScript, or Swift.
- [AddressElement](./elements/beta/payments/address.md) — Collects a billing or shipping address. Fields, order, and validation follow the selected country. Includes street autocomplete and methods to read or
- [BrandingElement](./elements/beta/payments/branding.md) — Whop's merchant-of-record notice: the Whop wordmark with links to the buyer terms and privacy policy. Mount it alongside every payment collection surf
- [CardElement](./elements/beta/payments/card.md) — Prearranged fields for card number, expiration, and security code. Create with `payments.create("card")`, enable your payment button from `onChange`, 
- [CardCvcElement](./elements/beta/payments/cardFields-cardCvc.md) — PCI-isolated hosted card security code field.
- [CardExpiryElement](./elements/beta/payments/cardFields-cardExpiry.md) — PCI-isolated hosted card expiration field.
- [CardNumberElement](./elements/beta/payments/cardFields-cardNumber.md) — PCI-isolated hosted card number field. Card numbers never reach the host page.
- [CardFields](./elements/beta/payments/cardFields.md) — Three separately mountable, PCI-isolated card fields for custom layouts: number, expiration, and security code. Create with `payments.create("cardFiel
- [EmailElement](./elements/beta/payments/email.md) — Collects the buyer's email and passes it to `payments.createConfirmationToken()` while mounted. Explicit `billingDetails.email` wins. A matching Whop 
- [Payments](./elements/beta/payments/overview.md) — Collect a payment from a `plan_` ID or inline currency and amount. Mount PaymentElement, CardElement, or CardFields, then call `payments.createConfirm
- [PaymentElement](./elements/beta/payments/payment.md) — Shows available payment methods and collects the selected method's required fields and disclosures. Use `change` to enable your pay button. In its act
- [PaymentRequest](./elements/beta/payments/paymentRequest.md) — Low-level Apple Pay or Google Pay sheet for custom buttons, express checkout, and shipping callbacks. Wallet tiles automate this flow through `payment
- [TaxIdElement](./elements/beta/payments/taxId.md) — Collects a business tax registration accepted by the API. Labels use buyer-facing names. The placeholder matches the selected format. `country` presel
- [EventsElement](./elements/beta/tracking/events.md) — Every event the account measured — page views, leads, purchases, and custom pixel events — as a raw, filterable stream. The rows behind any metric: fi
- [Tracking](./elements/beta/tracking/overview.md) — An account's tracked audience: everyone its pixel has seen, and every event they performed. Scope it to an account with `accountId`, then mount `peopl
- [PeopleElement](./elements/beta/tracking/people.md) — Everyone the account has seen — visitors and customers resolved from pixel activity, with their source, spend, and activity counters. Search, filter b
- [ActionsElement](./elements/beta/wallet/actions.md) — The account action row from Whop's balance dashboard. Deposit and Send open the Wallet controller's built-in overlays. Accept opens Whop's checkout-li
- [ActivityElement](./elements/beta/wallet/activity.md) — An account's ledger activity: every movement of money in or out, newest first. The list pages as the viewer scrolls, and rows report which one was tap
- [BalanceElement](./elements/beta/wallet/balances-balance.md) — An account's balance and a chart of how it changed. The total and its change sit at the top, the chart below that, and the time range buttons at the b
- [ListElement](./elements/beta/wallet/balances-list.md) — The holdings behind an account's balance. Every currency and token gets its own row, showing its name and its value in dollars, largest first. Rows ca
- [Balances](./elements/beta/wallet/balances.md) — Two views of an account's money. The balance view shows the total, a chart of how it changed, and a picker for the time range. The list view shows the
- [CardsElement](./elements/beta/wallet/cards.md) — Lists the account's active issued cards, most recently issued first. Needs an `accessToken`. The title and rows are click targets that emit events ins
- [DepositElement](./elements/beta/wallet/deposit.md) — Funds a Whop account. Renders an amount field and the account's live funding rails — crypto (a per-network deposit address with its QR) and bank trans
- [Wallet](./elements/beta/wallet/overview.md) — Drives an account's money surfaces. `actions` renders the Deposit, Accept, and Send controls from Whop's balance dashboard: Deposit and Send open thei
- [SendElement](./elements/beta/wallet/send.md) — Sends money from an account to a recipient — a user, another account, or a public claim link anyone can redeem. Renders its own recipient search resol
- [WithdrawElement](./elements/beta/wallet/withdraw.md) — Collects a payout amount and saved payout method, groups standard and instant delivery choices with live fees and arrival estimates, collects a new pa
- [Websites](./elements/beta/websites/overview.md) — An account's websites: every site built on whop.app plus every domain the Whop Pixel reports, with traffic and attributed revenue per domain. Mount `w
- [PixelSetupElement](./elements/beta/websites/pixel-setup.md) — Installs the Whop Pixel and wires conversion events: copy the snippet, check a page for it, confirm the events fire. Mount it inline, or inside your o
- [WebsitesElement](./elements/beta/websites/websites.md) — An account's websites in one table: every site built on whop.app — listed from the moment it exists, zeros until traffic arrives — merged by hostname 

### `fees` (1)

- [Fees](./fees.md) — Whop aims to be the cheapest, most resilient place to accept pure payments.

### `get-help/whop-support` (1)

- [Whop support](./get-help/whop-support.md) — Get help from Whop support anytime, anywhere

### `get-started` (1)

- [Get started with Whop](./get-started.md) — Whop is on a mission to deliver everyone a sustainable income.

### `launch-your-business` (1)

- [Launch your business](./launch-your-business.md) — Create an account on Whop and launch your business.

### `manage-your-business/growth-marketing` (6)

- [Whop Ads](./manage-your-business/growth-marketing/ads.md) — Run ads through Whop's agency accounts with first-party attribution from real buyer data
- [Affiliate program](./manage-your-business/growth-marketing/affiliate-program.md) — Learn how to set up an affiliate program for your whop
- [Support chats](./manage-your-business/growth-marketing/automated-messaging.md) — Learn how to send automated marketing messages on Whop
- [Promo codes](./manage-your-business/growth-marketing/promo-codes.md) — Learn how to create and manage promo codes
- [Tracking integrations](./manage-your-business/growth-marketing/tracking-integrations.md) — Set up external tracking integrations with analytics platforms.
- [Tracking links](./manage-your-business/growth-marketing/tracking-links.md) — Set up tracking links to see where your users are coming from

### `manage-your-business/manage-business` (3)

- [Analytics](./manage-your-business/manage-business/analytics.md) — Understand Whop's built-in analytics
- [Integrations](./manage-your-business/manage-business/integrations.md) — Set up external tracking integrations — this content has moved.
- [Upload legal documents](./manage-your-business/manage-business/legal-documents.md) — Learn how to upload legal documents and policies to your whop

### `manage-your-business/manage-payments` (5)

- [Refunds](./manage-your-business/manage-payments/issuing-refunds.md) — Learn how to refund your customers on Whop
- [Manage disputes](./manage-your-business/manage-payments/manage-disputes.md) — Handle chargebacks and payment disputes with the Dispute fighter
- [Manage users](./manage-your-business/manage-payments/manage-users.md) — Understand how to manage your users and make changes to their memberships
- [Resolution Center](./manage-your-business/manage-payments/resolution-center.md) — Manage refund requests before they turn into disputes
- [Send an invoice](./manage-your-business/manage-payments/send-invoice.md) — Learn how to create, send, and track invoices on Whop

### `manage-your-business/manage-payouts` (5)

- [Connected accounts](./manage-your-business/manage-payouts/connected-accounts.md) — Manage connected accounts for payouts, split payments, and platforms
- [Pay your team](./manage-your-business/manage-payouts/pay-your-team.md) — Learn how to pay your team members through Whop.
- [Payout methods](./manage-your-business/manage-payouts/payout-methods.md) — Add and manage how you receive payouts
- [Set up payouts](./manage-your-business/manage-payouts/set-up-payouts.md) — Learn how to set up payouts and withdraw your balance from Whop
- [Troubleshoot payouts](./manage-your-business/manage-payouts/troubleshoot-payouts.md) — Fix failed payouts, check status, and withdraw affiliate earnings

### `manage-your-business/payment-processing` (5)

- [Access higher checkout links](./manage-your-business/payment-processing/access-higher-checkout-links.md) — Apply to create checkout links over $2,500 and accept higher-priced offers
- [Checkout branding](./manage-your-business/payment-processing/checkout-branding.md) — Customize the look and feel of your checkout pages with button colors, fonts, and border styles
- [Create a checkout link](./manage-your-business/payment-processing/create-checkout-link.md) — Checkout links are the fastest way to accept payment.
- [Embed checkout](./manage-your-business/payment-processing/embed-checkout.md) — Learn how to embed Whop's checkout flow on your website
- [Set up pricing](./manage-your-business/payment-processing/set-up-pricing.md) — Choose your pricing model and what members get in your whop

### `manage-your-business/products` (4)

- [Create a product](./manage-your-business/products/create-product.md) — Create a new product and set pricing, apps, and checkout options
- [Create a waitlist](./manage-your-business/products/create-waitlist.md) — Have people join a waitlist before they can access your whop
- [Free trials](./manage-your-business/products/free-trials.md) — Learn how to set up a free trial for your whop
- [Manage products](./manage-your-business/products/manage-products.md) — Learn how to manage and update products in your whop

### `manage-your-business/team-management` (2)

- [Team management](./manage-your-business/team-management/manage-team-roles.md) — Add team members and manage who has access to your whop
- [Pay your team](./manage-your-business/team-management/pay-your-team.md) — This content has moved to Manage payouts.

### `memberships-and-access/access-discord-server` (2)

- [Access a Discord server](./memberships-and-access/access-discord-server/access-a-discord-server.md) — Link your Discord account to Whop and join Discord servers included with your membership.
- [Access content on mobile](./memberships-and-access/access-discord-server/access-content-on-mobile.md) — Use the Whop app or browser to access your memberships on your phone

### `memberships-and-access/accessing-your-purchase` (3)

- [Duplicate Whop accounts](./memberships-and-access/accessing-your-purchase/duplicate-whop-accounts.md) — What to do if you have more than one Whop account
- [How to find your purchase](./memberships-and-access/accessing-your-purchase/how-to-find-your-purchase.md) — Learn how to find your recent purchase from a creator on Whop.
- [Transfer a membership](./memberships-and-access/accessing-your-purchase/transfer-a-membership.md) — Learn how to move your membership or subscription to another Whop account.

### `memberships-and-access/cancellations-and-refunds` (4)

- [Cancel a subscription](./memberships-and-access/cancellations-and-refunds/cancel-a-subscription.md) — Turn off automatic renewal for a subscription membership.
- [Contact a merchant](./memberships-and-access/cancellations-and-refunds/contact-a-merchant.md) — How to reach a creator about refunds and what to do if they're unresponsive.
- [Request a refund](./memberships-and-access/cancellations-and-refunds/request-a-refund.md) — How to request a refund on a purchase you made on Whop
- [Status of a Resolution Center case](./memberships-and-access/cancellations-and-refunds/status-of-resolution-center-case.md) — Check the status of your refund or dispute case.

### `memberships-and-access/overview` (1)

- [Overview](./memberships-and-access/overview.md)

### `memberships-and-access/third-party-apps` (1)

- [Content Rewards](./memberships-and-access/third-party-apps/content-rewards.md) — Earn rewards as a member or run creator campaigns with Content Rewards.

### `payments-and-billing/fees` (4)

- [Adaptive pricing](./payments-and-billing/fees/adaptive-pricing.md) — Show buyers prices in their local currency at checkout to lower fees, unlock local payment methods, and reduce declines.
- [Fees](./payments-and-billing/fees/fees.md) — Whop aims to be the cheapest, most resilient place to accept pure payments.
- [In-app iOS purchases](./payments-and-billing/fees/in-app-ios-purchases.md) — How Apple's fees affect pricing and payouts when customers buy through the Whop iOS app.
- [Taxes](./payments-and-billing/fees/taxes.md) — Who is responsible for tax on your Whop sales, the options you can choose from, and how to pick the right one

### `payments-and-billing/financing` (4)

- [Financing options](./payments-and-billing/financing/all-bnpl-options.md) — Buy now pay later options for your customers — Afterpay, Splitit, Klarna, Sezzle, ZipPay, PayPal, and more.
- [Apply for financing](./payments-and-billing/financing/apply.md) — See who is eligible and how to apply to offer buy now pay later payment options at checkout.
- [SeQura guide](./payments-and-billing/financing/sequra-guide.md) — Let your Spanish customers split purchases into installments with SeQura
- [Splitit guide](./payments-and-billing/financing/splitit-guide.md) — Pay in monthly installments with no interest or credit check using your existing credit card.

### `payments-and-billing/local-payment-methods` (1)

- [Local payment methods](./payments-and-billing/local-payment-methods.md) — Pay with regional, non-card options like bank transfers, iDEAL, crypto, and more, with no additional setup required.

### `payments-and-billing/manage-billing` (1)

- [Billing portal](./payments-and-billing/manage-billing/billing-portal.md) — A self-service portal for subscription management.

### `payments-and-billing/payment-issues` (2)

- [Payment declines](./payments-and-billing/payment-issues/payment-decline-reasons.md) — How to resolve a failed payment
- [Failed subscription payments](./payments-and-billing/payment-issues/troubleshoot-failed-payments.md) — When a subscription payment is unsuccessful, Whop, the merchant, and the customer can take steps to fix the failure.

### `payments-and-billing/tap-to-pay` (1)

- [Tap to Pay on iPhone](./payments-and-billing/tap-to-pay.md) — Accept in-person contactless payments right on your iPhone with the Whop app. No card reader or extra hardware required.

### `payments/apple-pay` (1)

- [Enable Apple Pay](./payments/apple-pay.md) — Enable Apple Pay for your embedded checkout by verifying your domain

### `payments/billing-portal` (1)

- [Billing portal](./payments/billing-portal.md) — This content has moved to Payments & billing.

### `payments/checkout-embed` (1)

- [Embed checkout](./payments/checkout-embed.md) — Learn how to embed Whop's checkout flow on your website

### `payments/create-a-product` (1)

- [Create a product](./payments/create-a-product.md) — Learn how to set up products and pricing on Whop

### `payments/create-a-whop` (1)

- [Create a whop](./payments/create-a-whop.md) — Learn how to create a whop for payment processing

### `payments/create-checkout-link` (1)

- [Create a checkout link](./payments/create-checkout-link.md) — Checkout links are the fastest way to accept payment.

### `payments/credit-card-disputes` (1)

- [Credit card disputes](./payments/credit-card-disputes.md) — Learn how credit card disputes work on Whop

### `payments/dispute-fighter` (1)

- [Dispute fighter](./payments/dispute-fighter.md) — Manage and fight disputes from your dashboard

### `payments/financing` (1)

- [Financing](./payments/financing.md) — Let customers split payments into monthly installments

### `payments/one-click-checkout-button` (1)

- [One click checkout button](./payments/one-click-checkout-button.md) — Drop a single Apple Pay, Google Pay, or Whop Pay button on your site that opens Whop checkout in a dialog

### `payments/payment-declines` (1)

- [Payment declines](./payments/payment-declines.md) — Learn how payment declines work and how to manage them

### `payments/resolution-center` (1)

- [Resolution Center](./payments/resolution-center.md) — Manage refund requests before they turn into disputes

### `payments/send-an-invoice` (1)

- [Send an invoice](./payments/send-an-invoice.md) — Learn how to create, send, and track invoices on Whop

### `payments/set-up-payouts` (1)

- [Set up payouts](./payments/set-up-payouts.md) — Learn how to set up payouts and withdraw your balance from Whop

### `refer-businesses-to-whop` (1)

- [Refer businesses to Whop](./refer-businesses-to-whop.md) — Earn 30% of Whop's profit from businesses you refer.

### `sdk/elements` (26)

- [AddPayoutMethodElement](./sdk/elements/add-payout-method-element.md) — A UI element that allows users to add a new payout method (bank account, PayPal, etc.) to their account.
- [AutomaticWithdrawElement](./sdk/elements/automatic-withdraw-element.md) — A UI element that allows users to configure automatic withdrawals for their account.
- [AvailableCashBreakdownElement](./sdk/elements/available-cash-breakdown-element.md) — A UI element that shows a detailed breakdown of the available (withdrawable) cash balance.
- [BalanceElement](./sdk/elements/balance-element.md) — A UI element that displays the user's current balance including available, pending, and reserve amounts with an optional withdraw button.
- [BalancesElement](./sdk/elements/balances-element.md) — A UI element that displays a multi-currency balance overview with expandable currency rows showing available, pending, and reserve breakdowns per curr
- [ChangeAccountCountryElement](./sdk/elements/change-account-country-element.md) — A UI element that allows users to change the country associated with their payout account.
- [ChatElement](./sdk/elements/chat-element.md) — A UI element that displays a chat interface.
- [Create a chat session](./sdk/elements/chat-session.md) — Manages authentication and creates chat elements.
- [DmsListElement](./sdk/elements/dms-list-element.md) — A UI element that displays a dms list.
- [GenerateWithdrawalReceiptElement](./sdk/elements/generate-withdrawal-receipt-element.md) — A UI element that allows users to generate and request a receipt for a specific withdrawal.
- [Create a payouts session](./sdk/elements/payouts-session.md) — Manages authentication and creates payout elements.
- [PendingBreakdownElement](./sdk/elements/pending-breakdown-element.md) — A UI element that displays a breakdown of pending balance amounts that are being processed.
- [ReserveBreakdownElement](./sdk/elements/reserve-breakdown-element.md) — A UI element that shows a breakdown of reserve balance amounts explaining held funds and their expected availability.
- [ResetAccountElement](./sdk/elements/reset-account-element.md) — A UI element that allows users to reset their payout account.
- [SearchElement](./sdk/elements/search-element.md) — A UI element that allows users to search for messages in a channel, DM, or support chat.
- [StatusBannerElement](./sdk/elements/status-banner-element.md) — A UI element that displays a status banner indicating the user's account verification and compliance status.
- [Styling reference](./sdk/elements/styling-reference.md) — Stable CSS class names applied to Whop embeddable components
- [TreasuryBreakdownElement](./sdk/elements/treasury-breakdown-element.md) — A UI element that displays a breakdown of treasury funds including crypto portfolio holdings.
- [Types](./sdk/elements/types.md) — Shared type definitions for Whop embedded components
- [VerifyElement](./sdk/elements/verify-element.md) — A UI element that guides users through identity verification (KYC) and compliance requirements.
- [Create a wallet session](./sdk/elements/wallet-session.md) — Manages authentication and creates wallet elements.
- [Getting Started](./sdk/elements/whop-elements.md) — The main entry point for Whop embedded components.
- [WithdrawButtonElement](./sdk/elements/withdraw-button-element.md) — A UI element that renders a button for initiating withdrawals.
- [WithdrawElement](./sdk/elements/withdraw-element.md) — A UI element that provides a complete withdrawal form for users to request fund transfers.
- [WithdrawalBreakdownElement](./sdk/elements/withdrawal-breakdown-element.md) — A UI element that displays a detailed breakdown of a specific withdrawal.
- [WithdrawalsElement](./sdk/elements/withdrawals-element.md) — A UI element that displays a list of the user's past withdrawals.

### `supported-business-models/agency-services` (1)

- [Agencies](./supported-business-models/agency-services.md) — Learn how to launch and run your agency on Whop

### `supported-business-models/brick-and-mortar` (1)

- [Brick and mortar](./supported-business-models/brick-and-mortar.md) — Learn how to launch and run your brick-and-mortar business on Whop

### `supported-business-models/coaches` (1)

- [Coaches](./supported-business-models/coaches.md) — Learn how to launch your coaching business on Whop.

### `supported-business-models/dtc-ecommerce` (1)

- [Direct-to-consumer e-commerce](./supported-business-models/dtc-ecommerce.md) — Learn how to launch and run your e-commerce store on Whop

### `supported-business-models/educational-programs` (1)

- [Educational programs](./supported-business-models/educational-programs.md) — Learn how to sell educational programs on Whop

### `supported-business-models/events` (1)

- [Events](./supported-business-models/events.md) — Learn how to launch and run your events on Whop

### `supported-business-models/newsletters` (1)

- [Newsletters](./supported-business-models/newsletters.md) — Learn how to launch and run your newsletter on Whop

### `supported-business-models/paid-groups` (1)

- [Paid groups](./supported-business-models/paid-groups.md) — Learn how to offer a paid group on Whop.

### `supported-business-models/platforms` (1)

- [Platforms](./supported-business-models/platforms.md) — Build a marketplace or platform with connected accounts and facilitate payments

### `supported-business-models/saas` (1)

- [SaaS](./supported-business-models/saas.md) — Learn how to build and run your SaaS on Whop

### `third-party-integrations/gohighlevel` (1)

- [GoHighLevel](./third-party-integrations/gohighlevel.md) — Connect Whop payments to your GoHighLevel account. Install the payment connector, set Whop as your default provider, and start accepting payments.

### `third-party-integrations/hubspot` (1)

- [HubSpot](./third-party-integrations/hubspot.md) — Connect Whop to HubSpot. Sync products, generate checkout links from deals and contacts, and see payments natively in Commerce Hub.

### `third-party-integrations/quickbooks` (1)

- [QuickBooks](./third-party-integrations/quickbooks.md) — Sync Whop payments, refunds, and payouts to QuickBooks Online automatically. Keep your books accurate without manual data entry.

### `third-party-integrations/xero` (1)

- [Xero](./third-party-integrations/xero.md) — Sync Whop payments, invoices, and payouts to Xero automatically.

### `third-party-integrations/zapier` (1)

- [Zapier](./third-party-integrations/zapier.md) — Connect Whop to 7,000+ apps with Zapier. Automate triggers, actions, and conditional workflows.

### `trust-and-safety/account-health` (4)

- [Payment controls](./trust-and-safety/account-health/controls.md) — The controls Whop places on accounts with elevated dispute rates, what each one does, and how they lift
- [Managing dispute rates](./trust-and-safety/account-health/managing-dispute-rates.md) — The concrete steps that bring a dispute rate down, and how to handle a negative balance
- [Payment health](./trust-and-safety/account-health/payment-health.md) — Read your Payment health dashboard: your dispute rate, refund rate, why customers dispute, and the controls on your account
- [Reserves](./trust-and-safety/account-health/reserves.md) — Why Whop holds part of your balance in reserve, how each reserve type works, and when Whop releases held funds

### `trust-and-safety/overview` (1)

- [Overview](./trust-and-safety/overview.md)

### `trust-and-safety/staying-safe` (1)

- [Report a bad actor](./trust-and-safety/staying-safe/report-a-bad-actor.md) — Report other users or businesses for harassment, hateful content, scams, or other Terms of Service violations.

### `trust-and-safety/suspensions` (1)

- [Account suspensions](./trust-and-safety/suspensions/account-suspensions.md) — Understanding and resolving Whop account suspensions and bans, appeals, refunds, and funds handling.

### `trust-and-safety/trust-safety-overview` (4)

- [Community guidelines](./trust-and-safety/trust-safety-overview/community-guidelines.md)
- [Prohibited categories](./trust-and-safety/trust-safety-overview/prohibited-categories.md)
- [Sanctioned countries](./trust-and-safety/trust-safety-overview/sanctioned-countries.md) — List of countries Whop doesn't support due to international sanctions and regulatory restrictions.
- [Prohibited businesses](./trust-and-safety/trust-safety-overview/what-is-not-allowed-on-whop.md) — Prohibited and restricted categories, compliance obligations, and how Whop keeps the platform safe.

### `whop-apps/consumer-apps` (1)

- [Consumer apps](./whop-apps/consumer-apps.md) — Engage your audience with chat, courses, events, and social experiences

### `whop-apps/what-are-whop-apps` (1)

- [Whop apps](./whop-apps/what-are-whop-apps.md) — Apps are the building blocks for your business.

### `whop-apps/whop-app-store` (1)

- [The Whop App Store](./whop-apps/whop-app-store.md) — Everything you need to know about the Whop App Store

### `whop-finance/blocked-categories-and-merchants` (1)

- [Blocked categories & merchants](./whop-finance/blocked-categories-and-merchants.md) — Merchant categories (MCCs) and merchants that Whop Cards block by default

### `whop-finance/card-declines-and-risk-rules` (1)

- [Card declines & risk rules](./whop-finance/card-declines-and-risk-rules.md) — Why Whop Card transactions get declined and the risk rules applied during authorization

### `whop-finance/cards` (1)

- [Whop Cards](./whop-finance/cards.md) — Spend your balance instantly and earn 5% cashback on select merchants
