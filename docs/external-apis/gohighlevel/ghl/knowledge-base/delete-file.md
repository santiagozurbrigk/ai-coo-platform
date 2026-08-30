---
title: "Delete a file from knowledge base"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/delete-file"
seccion: "Knowledge Base > Files > Delete a file from knowledge base"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/knowledge-bases/files/:fileId"
---

# Delete a file from knowledge base

```http
DELETE /knowledge-bases/files/:fileId
```

Deletes one uploaded file from the authenticated location so the AI no longer uses it. WHEN TO USE: use this when you need to remove a document; use getFilesByKnowledgeBasePublic to find the file id; use deleteTrainedUrlsForKnowledgeBase for crawled pages instead. RETURNS: whether the delete succeeded.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **fileId** `string` _required_ — File ID to delete

### Response (200 · application/json)

Deletes a file from knowledge base

**Schema**

- **success** `boolean` _required_ — success

```json
{
  "success": true
}
```
