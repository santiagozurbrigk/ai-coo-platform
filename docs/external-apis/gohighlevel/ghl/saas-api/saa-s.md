---
title: "SaaS"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/saa-s"
seccion: "SaaS > SaaS"
api_version: "v3"
capturado: "2026-08-30"
---

# SaaS

API Service for SaaS

- [Get Agency Plans](https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-agency-plans) — Fetch all agency subscription plans for a given company ID
- [Allow Attach Rebilling](https://marketplace.gohighlevel.com/docs/ghl/saas-api/allow-attach-rebilling) — Marks a SaaS sub-account as awaiting rebilling attach and optionally stores the rebilling configuration that should be applied when the rebilling config is created. Sets payment_pending on the sub-account. Only allowed when the sub-account is in setup_pending state.
- [Disable SaaS for locations](https://marketplace.gohighlevel.com/docs/ghl/saas-api/bulk-disable-saas) — Disable SaaS for locations for given locationIds
- [Bulk Enable SaaS](https://marketplace.gohighlevel.com/docs/ghl/saas-api/bulk-enable-saas) — Enable SaaS mode for multiple locations with support for both SaaS v1 and v2
- [Get Location Wallet Balance](https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-location-wallet-balance) — Fetch the wallet balance for a specific location. Returns a resource object with balance details.
- [Update Location Wallet Balance](https://marketplace.gohighlevel.com/docs/ghl/saas-api/update-location-wallet-balance) — Update the wallet balance or complimentary credit settings for a specific location. Supports partial updates via updateMask field (AIP-134 compliant).
- [List agency wallet transactions](https://marketplace.gohighlevel.com/docs/ghl/saas-api/list-agency-wallet-transactions) — Fetch paginated wallet transactions for an agency (company). Supports skip/limit pagination, date-range and charge-type filters, timezone normalization, and additional non-indexed filters in the request body.
- [Enable SaaS for Sub-Account (Formerly Location)](https://marketplace.gohighlevel.com/docs/ghl/saas-api/enable-saas-location) — Enable SaaS for Sub-Account (Formerly Location) based on the data provided
- [Get Location Subscription Details](https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-location-subscription) — Fetch subscription details for a specific location from location metadata
- [Get locations by stripeId with companyId](https://marketplace.gohighlevel.com/docs/ghl/saas-api/locations) — Get locations by stripeCustomerId or stripeSubscriptionId with companyId
- [List location wallet transactions](https://marketplace.gohighlevel.com/docs/ghl/saas-api/list-location-wallet-transactions) — Fetch paginated wallet transactions for a sub-account (location). Supports skip/limit pagination, date-range and charge-type filters, timezone normalization, and additional non-indexed filters in the request body.
- [Pause location](https://marketplace.gohighlevel.com/docs/ghl/saas-api/pause-location) — Pause Sub account for given locationId
- [Remove attached config](https://marketplace.gohighlevel.com/docs/ghl/saas-api/remove-attached-config) — Clears attached SaaS plan (attachPlanId/attachPriceId) and/or attached rebilling config from a sub-account in setup_pending, and sets suspendedInfo.payment_pending to false.
- [Get SaaS Locations](https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-saas-locations) — Fetch all SaaS-activated locations for a company with pagination
- [Get SaaS Plan](https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-saas-plan) — Fetch a specific SaaS plan by plan ID
- [Update Rebilling](https://marketplace.gohighlevel.com/docs/ghl/saas-api/update-rebilling) — Bulk update rebilling for given locationIds
- [Update SaaS subscription](https://marketplace.gohighlevel.com/docs/ghl/saas-api/generate-payment-link) — Update SaaS subscription for given locationId and customerId
