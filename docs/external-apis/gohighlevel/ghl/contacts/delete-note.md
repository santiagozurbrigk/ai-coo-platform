---
title: "Delete Note"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/delete-note"
seccion: "Contacts > Notes > Delete Note"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/contacts/:contactId/notes/:id"
---

# Delete Note

```http
DELETE /contacts/:contactId/notes/:id
```

Delete Note

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **id** `string` _required_ — Note Id

### Response (200 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Whether the note was successfully deleted
- **succeded** `boolean` — Legacy misspelling of `succeeded`. Deprecated; use `succeeded`.

```json
{
  "succeeded": true
}
```
