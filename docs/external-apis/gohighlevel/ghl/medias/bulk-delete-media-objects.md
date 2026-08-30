---
title: "Bulk Delete / Trash Files/Folders"
source: "https://marketplace.gohighlevel.com/docs/ghl/medias/bulk-delete-media-objects"
seccion: "Media Storage > Media Files/Folders > Bulk Delete / Trash Files/Folders"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/medias/delete-files"
---

# Bulk Delete / Trash Files/Folders

```http
PUT /medias/delete-files
```

Soft-deletes or trashes multiple files and folders in a single request

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **filesToBeDeleted** `object[]` _required_ — Array of file objects to be deleted or trashed
- **altType** `string` _required_ — Type of entity that owns the files
  - Available options: `location`
- **altId** `string` _required_ — Location identifier
- **status** `string` _required_ — Status to set for the files (deleted or trashed)
  - Available options: `deleted`, `trashed`

```json
{
  "filesToBeDeleted": [
    {
      "_id": "686f630df0d3166d68fbcec2"
    }
  ],
  "altType": "location",
  "altId": "sx6wyHhbFdRXh302LLNR",
  "status": "deleted"
}
```

### Response (200 · application/json)

Successful response

**Schema**

```json
[
  {
    "deleted": true,
    "id": "686f630df0d3166d68fbcec2"
  }
]
```
