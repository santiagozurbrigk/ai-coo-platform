---
title: "Get knowledge base by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-knowledge-base-by-id"
seccion: "Knowledge Base > Knowledge Base > Get knowledge base by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/knowledge-bases/:knowledgeBaseId"
---

# Get knowledge base by ID

```http
GET /knowledge-bases/:knowledgeBaseId
```

Retrieves one knowledge base by id, including name, metadata, and timestamps. WHEN TO USE: use this when you need to inspect a single knowledge base; use listAllKnowledgeBasesPaginated to browse; use updateKnowledgeBase to rename it. RETURNS: success and the knowledge base record.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **knowledgeBaseId** `string` _required_ — The unique identifier of the knowledge base

### Response (200 · application/json)

Knowledge base by ID retrieved successfully

**Schema**

- **success** `boolean` _required_ — Success status of the operation
- **data** `object` _required_ — Knowledge base details

```json
{
  "success": true,
  "data": {}
}
```
