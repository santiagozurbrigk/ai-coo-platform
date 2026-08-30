---
title: "Delete Association"
source: "https://marketplace.gohighlevel.com/docs/ghl/associations/delete-association"
seccion: "Associations > Associations > Delete Association"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/associations/:associationId"
---

# Delete Association

```http
DELETE /associations/:associationId
```

Delete USER_DEFINED Association By Id, deleting an association will also all the relations for that association

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **associationId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **deleted** `boolean` _required_ — Deletion status
- **id** `string` _required_ — Association Id
- **message** `string` _required_

```json
{
  "deleted": true,
  "id": "6d6f6e676f5f6576656e7473",
  "message": "Association deleted successfully"
}
```
