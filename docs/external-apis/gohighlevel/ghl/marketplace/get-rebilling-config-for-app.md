---
title: "Get rebilling config for an app subscription and usage plans"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/get-rebilling-config-for-app"
seccion: "Developer marketplace > App Billing Management > Get rebilling config for an app subscription and usage plans"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/marketplace/app/:appId/rebilling-config/location/:locationId"
---

# Get rebilling config for an app subscription and usage plans

```http
GET /marketplace/app/:appId/rebilling-config/location/:locationId
```

Get rebilling config for an app subscription and usage plans for the authenticated sub-account. This endpoint returns the subscription and usage plans for an app.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **appId** `string` _required_ — ID of the app to get rebilling config
- **locationId** `string` _required_ — ID of the Sub-Account location to get rebilling config for

### Response (200 · application/json)

Successfully retrieved rebilling config for the app

**Schema**

- **plans** `object` _required_ — The rebilling plans configuration

```json
{
  "plans": {
    "subscription": [
      {
        "resellingAmount": 0,
        "baseAmount": 999,
        "planId": "5ae000000000000000000000",
        "features": [
          "feature1",
          "feature2"
        ],
        "paymentType": "month",
        "name": "Monthly Plan - 999",
        "paymentTime": "month"
      }
    ],
    "usage": [
      {
        "productType": "workflow_action",
        "productName": "Send Group iMessage",
        "usageUnit": "action / message",
        "meterId": "680b97022b4a34420f5f9b93",
        "meterName": "Send Group iMessage",
        "fixedPricePerUnit": 0.01001,
        "priceType": "fixed",
        "minPricePerUnit": "0.01001",
        "maxPricePerUnit": "0.01001",
        "executionLimitPerCycle": 1000
      }
    ]
  }
}
```
