---
title: "Delete Account"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-account"
seccion: "Social Planner > Account > Delete Account"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/social-media-posting/:locationId/accounts/:id"
---

# Delete Account

```http
DELETE /social-media-posting/:locationId/accounts/:id
```

Delete account and account from group

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — Id

### Query parameters

- **companyId** `string` — Company ID
- **userId** `string` — User ID

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
  "message": "Deleted Account",
  "results": {
    "locationId": "ve9EPM428h8vShlRW1KT",
    "id": "65fac446d599990d1313c1dd"
  }
}
```
