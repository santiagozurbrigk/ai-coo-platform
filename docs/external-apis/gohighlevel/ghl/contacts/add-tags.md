---
title: "Add Tags"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/add-tags"
seccion: "Contacts > Tags > Add Tags"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/:contactId/tags"
---

# Add Tags

```http
POST /contacts/:contactId/tags
```

Add Tags

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Request body (application/json)

**Body required**

- **tags** `string[]` _required_ — List of tags to add or remove

```json
{
  "tags": [
    "minim",
    "velit magna"
  ]
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **tags** `string[]` — Current tags on the contact after the operation

```json
{
  "tags": [
    "minim",
    "velit magna"
  ]
}
```
