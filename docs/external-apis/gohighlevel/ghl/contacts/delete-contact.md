---
title: "Delete Contact"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/delete-contact"
seccion: "Contacts > Contacts > Delete Contact"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/contacts/:contactId"
---

# Delete Contact

```http
DELETE /contacts/:contactId
```

Delete Contact

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Response (200 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Whether the delete operation succeeded
- **succeded** `boolean` — Legacy misspelling of `succeeded`. Deprecated; use `succeeded`.

```json
{
  "succeeded": true
}
```
