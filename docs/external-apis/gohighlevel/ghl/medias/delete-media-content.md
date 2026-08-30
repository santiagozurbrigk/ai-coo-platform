---
title: "Delete File or Folder"
source: "https://marketplace.gohighlevel.com/docs/ghl/medias/delete-media-content"
seccion: "Media Storage > Media Files/Folders > Delete File or Folder"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/medias/:id"
---

# Delete File or Folder

```http
DELETE /medias/:id
```

Deletes specific file or folder from the media storage

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_

### Query parameters

- **altType** `string` _required_ — AltType
  - Available options: `location`
- **altId** `string` _required_ — location Id

### Response (200)

Successful response
