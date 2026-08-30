---
title: "Get Accounts"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-account"
seccion: "Social Planner > Account > Get Accounts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/accounts"
---

# Get Accounts

```http
GET /social-media-posting/:locationId/accounts
```

Get list of accounts and groups

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Accounts",
  "results": {
    "accounts": [
      {
        "id": "aF3KhyL8JIuBwzK3m7Ly_Lx1EI6YIgQYMQi0ytFXv_12554616564525983496",
        "name": "Sample Account",
        "platform": "google"
      }
    ],
    "groups": [
      {
        "id": "6284c43d519161e96cc09c13",
        "name": "Primary"
      }
    ]
  }
}
```
