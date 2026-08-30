---
title: "Uploads a file to knowledge base (max file size: 10MB)"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/upload-file"
seccion: "Knowledge Base > Files > Uploads a file to knowledge base (max file size: 10MB)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/knowledge-bases/files"
---

# Uploads a file to knowledge base (max file size: 10MB)

```http
POST /knowledge-bases/files
```

Uploads a PDF, DOC, or DOCX file (max 10MB) into a knowledge base for training. WHEN TO USE: use this when you need to add a document source; use getFilesByKnowledgeBasePublic to list uploads; use deleteFile to remove a file. Do not use this for website pages — use discoverWebsite / trainDiscoveredUrls. RETURNS: success and the uploaded file url, fileId, and folder path.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (multipart/form-data)

**Body required**

File upload with metadata

- **locationId** `string` — location id
- **knowledgeBaseId** `string` _required_ — knowledge base id
- **file** `string<binary>` _required_ — File to upload (max size: 10MB). Supported formats: PDF, DOC, DOCX

```json
{
  "locationId": "ocQHyuzHvysMo5N5VsXc",
  "knowledgeBaseId": "ocQHyuzHvysMo5N5VsXc",
  "file": "string"
}
```

### Response (200 · application/json)

Uploads a file to knowledge base

**Schema**

- **success** `boolean` _required_ — success
- **data** `object` _required_ — details of the uploaded file

```json
{
  "success": true,
  "data": {
    "url": "https://storage.googleapis.com/bucket/locations/abc123/file.pdf",
    "fileId": "ocQHyuzHvysMo5N5VsXc",
    "folderPath": "locations/ocQHyuzHvysMo5N5VsXc"
  }
}
```
