---
title: "Bulk Update Files/Folders"
source: "https://marketplace.gohighlevel.com/docs/ghl/medias/bulk-update-media-objects"
seccion: "Media Storage > Media Files/Folders > Bulk Update Files/Folders"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/medias/update-files"
---

# Bulk Update Files/Folders

```http
PUT /medias/update-files
```

Updates metadata or status of multiple files and folders

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location identifier
- **altType** `string` _required_ — Type of entity that owns the files
  - Available options: `location`
- **filesToBeUpdated** `object[]` _required_ — Array of file objects to be updated

```json
{
  "altId": "sx6wyHhbFdRXh302LLNR",
  "altType": "location",
  "filesToBeUpdated": [
    {
      "id": "686f9817f0d3165be9fbcef6",
      "name": "Updated File Name.pdf"
    }
  ]
}
```

### Response (200 · application/json)

Successful response

**Schema**

```json
[
  {
    "updated": true,
    "id": "686f9817f0d3165be9fbcef6"
  }
]
```
