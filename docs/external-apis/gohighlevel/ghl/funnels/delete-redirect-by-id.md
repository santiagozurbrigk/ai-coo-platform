---
title: "Delete Redirect By Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/funnels/delete-redirect-by-id"
seccion: "Funnels > Redirect > Delete Redirect By Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/funnels/lookup/redirect/:id"
---

# Delete Redirect By Id

```http
DELETE /funnels/lookup/redirect/:id
```

The "Delete Redirect By Id" API Allows deletion of a URL redirect from the system using its unique identifier. Use this endpoint to delete a URL redirect with the specified ID using details provided in the request payload.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_

### Query parameters

- **locationId** `string` _required_

### Response (200 · application/json)

Successful response - URL redirect deleted successfully

**Schema**

- **data** `object` _required_ — Status of the delete operation

```json
{
  "data": {
    "status": "ok"
  }
}
```
