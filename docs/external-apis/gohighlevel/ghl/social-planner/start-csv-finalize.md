---
title: "Start CSV Finalize"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/start-csv-finalize"
seccion: "Social Planner > CSV > Start CSV Finalize"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/social-media-posting/:locationId/csv/:id"
---

# Start CSV Finalize

```http
PATCH /social-media-posting/:locationId/csv/:id
```

Finalize a CSV import and schedule all posts for publishing

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — CSV Id

### Request body (application/json)

**Body required**

- **userId** `string` _required_ — User ID

```json
{
  "userId": "sdfdsfdsfEWEsdfsdsW32dd"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Updated Successfully"
}
```
