---
title: "Create Folder"
source: "https://marketplace.gohighlevel.com/docs/ghl/medias/create-media-folder"
seccion: "Media Storage > Media Files/Folders > Create Folder"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/medias/folder"
---

# Create Folder

```http
POST /medias/folder
```

Creates a new folder in the media storage

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — Type of entity (location only)
  - Available options: `location`
- **name** `string` _required_ — Name of the folder to be created
- **parentId** `string` — ID of the parent folder (optional)

```json
{
  "altId": "sx6wyHhbFdRXh302LLNR",
  "altType": "location",
  "name": "New Folder",
  "parentId": "64af50c42d567a3b4f5989e0"
}
```

### Response (200 · application/json)

Returns the newly created folder object

**Schema**

- **altId** `string` _required_ — Location identifier that owns this folder
- **altType** `string` _required_ — Type of entity that owns the folder
  - Available options: `location`
- **name** `string` _required_ — Name of the folder
- **parentId** `string` — ID of the parent folder (null for root folders)
- **type** `string` _required_ — Type of the object (always 'folder' for folders)
- **deleted** `boolean` — Whether the folder has been deleted
- **pendingUpload** `boolean` — Whether there are pending uploads to this folder
- **category** `string` — Primary category of content stored in the folder
- **subCategory** `string` — Sub-category of content stored in the folder
- **isPrivate** `boolean` — Whether the folder is private and not publicly accessible
- **relocatedFolder** `boolean` — Whether the folder has been moved from its original location
- **migrationCompleted** `boolean` — Whether the data migration process has been completed for this folder
- **appFolder** `boolean` — Whether this is a system-generated application folder
- **isEssential** `boolean` — Whether the folder is essential and should not be deleted
- **status** `string` — Current status of the folder
- **lastUpdatedBy** `string` — ID of the user who last updated the folder

```json
{
  "altId": "sx6wyHhbFdRXh302LLNR",
  "altType": "location",
  "name": "New Folder",
  "parentId": "64af50c42d567a3b4f5989e0",
  "type": "folder",
  "deleted": false,
  "pendingUpload": false,
  "category": "image",
  "subCategory": "logo",
  "isPrivate": false,
  "relocatedFolder": false,
  "migrationCompleted": true,
  "appFolder": false,
  "isEssential": false,
  "status": "string",
  "lastUpdatedBy": "user-uuid-123"
}
```
