---
title: "Get all files by knowledge base"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-files-by-knowledge-base-public"
seccion: "Knowledge Base > Files > Get all files by knowledge base"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/knowledge-bases/files"
---

# Get all files by knowledge base

```http
GET /knowledge-bases/files
```

Lists files uploaded to a knowledge base, with optional pagination and name search. WHEN TO USE: use this when you need to see uploaded documents; use uploadFile to add a file; use getFileById for one file; use deleteFile to remove one. RETURNS: the file list for the knowledge base.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **knowledgeBaseId** `string` _required_ — knowledge base id
- **limit** `number` — Maximum number of files to return

  Default value:

  `10`

- **lastFileId** `string` — Last file id, used for pagination
- **offset** `number` — Zero-based offset for search-mode pagination. Ignored when lastFileId is provided.

  Default value:

  `0`

- **search** `string` — Case-insensitive substring to match against the file name.

### Response (200 · application/json)

List of files by knowledge base

**Schema**

- **success** `boolean` _required_ — success
- **data** `object` _required_ — data

```json
{
  "success": true,
  "data": {
    "files": [],
    "count": 0
  }
}
```
