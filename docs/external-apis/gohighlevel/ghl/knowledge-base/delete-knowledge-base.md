---
title: "Delete a knowledge base"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/delete-knowledge-base"
seccion: "Knowledge Base > Knowledge Base > Delete a knowledge base"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/knowledge-bases/:knowledgeBaseId"
---

# Delete a knowledge base

```http
DELETE /knowledge-bases/:knowledgeBaseId
```

Permanently deletes a knowledge base and its associated trained content. WHEN TO USE: use this when the whole knowledge source is no longer needed; use deleteTrainedUrlsForKnowledgeBase or delete (FAQ) to remove only some content. RETURNS: whether the delete succeeded.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **knowledgeBaseId** `string` _required_ — The unique identifier of the knowledge base to delete

### Response (200 · application/json)

Knowledge base deleted successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the delete operation was successful

```json
{
  "success": true
}
```
