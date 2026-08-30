---
title: "Get file by id"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-file-by-id"
seccion: "Knowledge Base > Files > Get file by id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/knowledge-bases/files/:fileId"
---

# Get file by id

```http
GET /knowledge-bases/files/:fileId
```

Retrieves one uploaded file by id for the authenticated location. WHEN TO USE: use this when you need to inspect a single file; use getFilesByKnowledgeBasePublic to list files; use deleteFile to remove it. RETURNS: uploaded file details for that file id.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **fileId** `string` _required_ — File ID to retrieve

### Response (200 · application/json)

Returns uploaded file details by file id

**Schema**

- **success** `boolean` _required_ — success
- **data** `object` _required_ — data

```json
{
  "success": true,
  "data": {
    "id": "iX0Ybt39yeZ7oEphewiM",
    "name": "test.docx",
    "locationId": "qIyivCmsuEOSnyoFYEej",
    "knowledgeBaseId": "byP7JUyYiHC2EdbpSpdB",
    "size": 6471,
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "encoding": "7bit",
    "status": "PROCESSED",
    "deleted": false,
    "createdAt": "2025-08-25T11:44:29.904Z",
    "updatedAt": "2025-08-25T11:46:36.238Z"
  }
}
```
