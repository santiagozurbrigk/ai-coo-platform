---
title: "Update Opportunity Status"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/update-opportunity-status"
seccion: "Opportunities > Opportunities > Update Opportunity Status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/opportunities/:id/status"
---

# Update Opportunity Status

```http
PUT /opportunities/:id/status
```

Update Opportunity Status

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Opportunity Id

### Request body (application/json)

**Body required**

- **status** `string` _required_ — New status for the opportunity
  - Available options: `open`, `won`, `lost`, `abandoned`, `all`
- **lostReasonId** `string` — lost reason Id

```json
{
  "status": "open",
  "lostReasonId": "CLu7BaljjqrEjBGKTNNe"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Indicates whether the operation was successful

```json
{
  "success": true
}
```
