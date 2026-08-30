---
title: "Update File/Folder"
source: "https://marketplace.gohighlevel.com/docs/ghl/medias/update-media-object"
seccion: "Media Storage > Media Files/Folders > Update File/Folder"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/medias/:id"
---

# Update File/Folder

```http
POST /medias/:id
```

Updates a single file or folder by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Unique identifier of the file or folder to update

### Request body (application/json)

**Body required**

- **name** `string` _required_ — New name for the file or folder
- **altType** `string` _required_ — Type of entity that owns the file or folder
  - Available options: `location`
- **altId** `string` _required_ — Location identifier that owns the file or folder

```json
{
  "name": "Updated File Name.pdf",
  "altType": "location",
  "altId": "sx6wyHhbFdRXh302LLNR"
}
```

### Response (200 · application/json)

Successful response

**Schema**

```json
{
  "updated": true,
  "traceId": "33a641a2-c4a6-4123-aa82-c5b84f1a14ee"
}
```
