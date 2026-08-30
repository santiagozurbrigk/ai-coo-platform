---
title: "Disconnect existing provider config"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/disconnect-config"
seccion: "Payments > Custom Provider > Disconnect existing provider config"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/payments/custom-provider/disconnect"
---

# Disconnect existing provider config

```http
POST /payments/custom-provider/disconnect
```

API to disconnect an existing payment config for given location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location id

### Request body (application/json)

**Body required**

- **liveMode** `boolean` _required_ — Whether the config is for test mode or live mode. true represents config is for live payments

```json
{
  "liveMode": "true"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Whether the custom provider config is disconnect or not. true represents config is disconnect

```json
{
  "success": "true"
}
```
