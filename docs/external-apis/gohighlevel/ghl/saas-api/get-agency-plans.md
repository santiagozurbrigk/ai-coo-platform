---
title: "Get Agency Plans"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-agency-plans"
seccion: "SaaS > SaaS > Get Agency Plans"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/saas/agency-plans/:companyId"
---

# Get Agency Plans

```http
GET /saas/agency-plans/:companyId
```

Fetch all agency subscription plans for a given company ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **companyId** `string` _required_

### Response (200 · application/json)

List of agency subscription plans for the company.

**Schema**

  Array [

  ]

```json
[
  {
    "planId": "66c4d36534f21f900dc2a265",
    "title": "AED 1.5 changed",
    "description": "AED 1.5",
    "saasProducts": [
      "2-way-text-messaging",
      "gmb-messaging",
      "web-chat",
      "reputation-management"
    ],
    "features": [
      "contacts-conversations",
      "web-chat",
      "workflows"
    ],
    "addOns": [
      "CONVERSATIONS_AI",
      "CP_BRANDED_APP_49",
      "WORDPRESS_V1"
    ],
    "planLevel": 0,
    "trialPeriod": 16,
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
    "productId": "66a9edbfcc6c5090bedb7974",
    "isSaaSV2": true,
    "providerLocationId": "r06mdj4OrrERzYDvsOdh",
    "createdAt": "2024-07-31T07:54:41.885Z",
    "updatedAt": "2025-04-01T12:27:29.167Z"
  }
]
```
