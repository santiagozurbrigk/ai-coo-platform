---
title: "Get SaaS Plan"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-saas-plan"
seccion: "SaaS > SaaS > Get SaaS Plan"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/saas/saas-plan/:planId"
---

# Get SaaS Plan

```http
GET /saas/saas-plan/:planId
```

Fetch a specific SaaS plan by plan ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **planId** `string` _required_

### Query parameters

- **companyId** `string` _required_

### Response (200 · application/json)

The requested SaaS plan.

**Schema**

- **planId** `string` _required_ — Unique identifier for the SaaS plan
- **companyId** `string` _required_ — Company ID associated with the SaaS plan
- **title** `string` _required_ — Title of the SaaS plan
- **description** `string` _required_ — Description of the SaaS plan
- **saasProducts** `string[]` _required_ — Array of SaaS products included in the plan
- **features** `string[]` — Array of v2 feature-permission feature IDs included in the plan. This is the v2-native representation of the plan entitlements (the successor to `saasProducts`); the two are kept in sync via the plan create/update dual-write.
- **addOns** `string[]` — Array of add-ons included in the plan
- **planLevel** `number` _required_ — Level of the plan (0-4)
- **trialPeriod** `number` _required_ — Trial period in days
- **setupFee** `number` — Setup fee for the plan
- **userLimit** `number` — User limit for the plan
- **contactLimit** `number` — Contact limit for the plan
- **prices** `object[]` _required_ — Prices for the plan
- **categoryId** `string` — Category ID for the plan
- **snapshotId** `string` — Snapshot ID for the plan
- **providerLocationId** `string` — Provider location ID
- **productId** `string` — Product ID for the plan
- **isSaaSV2** `boolean` _required_ — Indicates if this is a SaaS V2 plan
- **createdAt** `string<date-time>` _required_ — Creation timestamp
- **updatedAt** `string<date-time>` _required_ — Last update timestamp

```json
{
  "planId": "66c4d36534f21f900dc2a265",
  "companyId": "66c4d36534f21f900dc2a265",
  "title": "AED 1.5 changed",
  "description": "AED 1.5",
  "saasProducts": [
    "2-way-text-messaging",
    "gmb-messaging",
    "web-chat"
  ],
  "features": [
    "contacts-conversations",
    "web-chat",
    "workflows"
  ],
  "addOns": [
    "YEXT_V2",
    "WHATSAPP_V1",
    "WORDPRESS_V1",
    "AI_EMPLOYEE",
    "Ad_Publishing_Connect_Your_BM"
  ],
  "planLevel": 0,
  "trialPeriod": 16,
  "setupFee": 100,
  "userLimit": 50,
  "contactLimit": 50,
  "prices": [
    {
      "id": "66a9edbfcc6c505a22db7976",
      "billingInterval": "month",
      "active": true,
      "amount": 150,
      "currency": "AED",
      "symbol": "$"
    }
  ],
  "categoryId": "66911cdc98508ec2731979b9",
  "snapshotId": "G8KmpIeLnZc7ZMoJoxDx",
  "providerLocationId": "r06mdj4OrrERzYDvsOdh",
  "productId": "66a9edbfcc6c5090bedb7974",
  "isSaaSV2": true,
  "createdAt": "2024-07-31T07:54:41.885Z",
  "updatedAt": "2025-04-01T12:27:29.167Z"
}
```
