---
title: "Delete CSV"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-csv"
seccion: "Social Planner > CSV > Delete CSV"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/social-media-posting/:locationId/csv/:id"
---

# Delete CSV

```http
DELETE /social-media-posting/:locationId/csv/:id
```

Delete a CSV import and all its associated posts

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — CSV Id

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
  "message": "Deleted CSV",
  "results": {
    "csv": {
      "locationId": "ve9EPM428h8vShlRW1KT",
      "fileName": "sample.csv",
      "status": "deleted",
      "count": 5
    }
  }
}
```
