---
title: "Get List of Files/Folders"
source: "https://marketplace.gohighlevel.com/docs/ghl/medias/fetch-media-content"
seccion: "Media Storage > Media Files/Folders > Get List of Files/Folders"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/medias/files"
---

# Get List of Files/Folders

```http
GET /medias/files
```

Fetches list of files and folders from the media storage

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **offset** `string` — Number of files to skip in listing
- **limit** `string` — Number of files to show in the listing
- **sortBy** `string` _required_ — Field to sorting the file listing by
- **sortOrder** `string` _required_ — Direction in which file needs to be sorted
- **type** `string` _required_ — Type
- **query** `string` — Query text
- **altType** `string` _required_ — AltType
  - Available options: `location`
- **altId** `string` _required_ — location Id
- **parentId** `string` — parent id or folder id
- **fetchAll** `string` — Fetch all files or folders

### Response (200 · application/json)

Successful response

**Schema**

- **files** `string[]` _required_ — Array of File Objects

```json
{
  "files": {
    "altId": "locationId",
    "altType": "location",
    "name": "file name",
    "parentId": "parent folder id",
    "url": "file url",
    "path": "file path"
  }
}
```
