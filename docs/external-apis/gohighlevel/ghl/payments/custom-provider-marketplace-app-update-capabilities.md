---
title: "Custom-provider marketplace app update capabilities"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/custom-provider-marketplace-app-update-capabilities"
seccion: "Payments > Custom Provider > Custom-provider marketplace app update capabilities"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/payments/custom-provider/capabilities"
---

# Custom-provider marketplace app update capabilities

```http
PUT /payments/custom-provider/capabilities
```

Toggle capabilities for the marketplace app tied to the OAuth client

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **supportsSubscriptionSchedules** `boolean` _required_ — Whether the marketplace app supports subscription schedules or not
- **companyId** `string` — Company id. Mandatory if locationId is not provided
- **locationId** `string` — Location / Sub-account id. Mandatory if companyId is not provided

```json
{
  "supportsSubscriptionSchedules": true,
  "companyId": "Yjnwuduw83e8x30sm0",
  "locationId": "Yjnwuduw83e8x30sm0"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Whether the custom provider capabilities are updated or not. true represents capabilities are updated

```json
{
  "success": "true"
}
```
