---
title: "Upload File into Media Storage"
source: "https://marketplace.gohighlevel.com/docs/ghl/medias/upload-media-content"
seccion: "Media Storage > Media Files/Folders > Upload File into Media Storage"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/medias/upload-file"
---

# Upload File into Media Storage

```http
POST /medias/upload-file
```

If hosted is set to true then fileUrl is required. Else file is required. If adding a file, maximum allowed is 25 MB. For video files, the maximum allowed size is 500 MB.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (multipart/form-data)

**Body required**

- **file** `string<binary>`
- **hosted** `boolean`
- **fileUrl** `string`
- **name** `string`
- **parentId** `string`

```json
{
  "file": "string",
  "hosted": true,
  "fileUrl": "string",
  "name": "string",
  "parentId": "string"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **fileId** `string` _required_ — ID of the uploaded file
- **url** `string` _required_ — Google Cloud Storage URL of the uploaded file

```json
{
  "fileId": "file.pdf",
  "url": "https://storage.googleapis.com/bucket-name/path/to/file.pdf"
}
```
