---
title: "Delete an existing knowledge base FAQ"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/delete"
seccion: "Knowledge Base > Faqs > Delete an existing knowledge base FAQ"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/knowledge-bases/faqs/:id"
---

# Delete an existing knowledge base FAQ

```http
DELETE /knowledge-bases/faqs/:id
```

Permanently deletes one FAQ from a knowledge base. WHEN TO USE: use this when a canned answer is outdated; use update to revise it instead; use list to find the FAQ id. RETURNS: whether the delete succeeded.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — faq ID as string

### Response (200 · application/json)

FAQ deleted successfully

**Schema**

- **success** `boolean` _required_ — Success status of the delete operation

```json
{
  "success": true
}
```
