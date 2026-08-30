---
title: "Update a knowledge base"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/update-knowledge-base"
seccion: "Knowledge Base > Knowledge Base > Update a knowledge base"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/knowledge-bases/:id"
---

# Update a knowledge base

```http
PUT /knowledge-bases/:id
```

Updates the name and/or description of an existing knowledge base. WHEN TO USE: use this when you need to rename or re-describe a knowledge base; use createKnowledgeBase to add one; use deleteKnowledgeBase to remove one. RETURNS: whether the update succeeded.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — The unique identifier of the knowledge base to update

### Request body (application/json)

**Body required**

- **name** `string` — field to update the name of the knowledge base
- **description** `string` — field to update the description of the knowledge base

```json
{
  "name": "My Updated Knowledge Base",
  "description": "An updated description for this knowledge base"
}
```

### Response (200 · application/json)

Knowledge base updated successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the update operation was successful

```json
{
  "success": true
}
```
