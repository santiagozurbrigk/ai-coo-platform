---
title: "Enable SaaS for Sub-Account (Formerly Location)"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/enable-saas-location"
seccion: "SaaS > SaaS > Enable SaaS for Sub-Account (Formerly Location)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/enable-saas/:locationId"
---

# Enable SaaS for Sub-Account (Formerly Location)

```http
POST /saas/enable-saas/:locationId
```

Enable SaaS for Sub-Account (Formerly Location) based on the data provided

> info
>
> This feature is only available on Agency Pro ($497) plan.
>

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_

### Request body (application/json)

**Body required**

- **stripeAccountId** `string` — Stripe account id(Required only for SaaS V1)
- **name** `string` — Name of the stripe customer(Required only for SaaS V1)
- **email** `string` — Email of the stripe customer(Required only for SaaS V1)
- **stripeCustomerId** `string` — Stripe customer id if exists(Required only for SaaS V1)
- **companyId** `string` _required_
- **isSaaSV2** `boolean` _required_ — Denotes if it is a saas v2 or v1 sub-account
- **contactId** `string` — Agency subaccount used for payment provider integration(Required Only for SaaS V2)
- **providerLocationId** `string` — Agency Subaccount ID
- **description** `string` — Description
- **saasPlanId** `string` — Required only while pre-configuring saas subscription
- **priceId** `string` — Required only while pre-configuring saas subscription

```json
{
  "stripeAccountId": "acct_1QDPY5FpU9DlKp7RQ8BXfywx",
  "name": "John Doe",
  "email": "[email protected]",
  "stripeCustomerId": "cus_1QDPY5FpU9DlKp7RQ8BXfywx",
  "companyId": "string",
  "isSaaSV2": true,
  "contactId": "1QDPY5FpU9DlKp7RQ8BXfywx",
  "providerLocationId": "r06mdj4OrrERzYDvsOdh",
  "description": "Description",
  "saasPlanId": "1QDPY5FpU9DlKp7RQ8BXfywx",
  "priceId": "price_1QDPY5FpU9DlKp7RQ8BXfywx"
}
```

### Response (201 · application/json)

Result of enabling SaaS for the sub-account.

**Schema**

oneOf

SaaS v1 enable response (proxied from the internal enable-saas API).

- **customer_id** `string` _required_
- **ok** `boolean` _required_
- **paymentMethodAdded** `boolean` _required_

```json
{
  "customer_id": "cus_1QDPY5FpU9DlKp7RQ8BXfywx",
  "ok": true,
  "paymentMethodAdded": true
}
```
