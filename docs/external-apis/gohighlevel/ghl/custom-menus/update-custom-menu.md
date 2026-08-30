---
title: "Update Custom Menu Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-menus/update-custom-menu"
seccion: "Custom menus > Custom Menu Links > Update Custom Menu Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/custom-menus/:customMenuId"
---

# Update Custom Menu Link

```http
PUT /custom-menus/:customMenuId
```

Updates an existing custom menu for a given company. Requires authentication and proper permissions.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **customMenuId** `string` _required_ — ID of the custom menu to update

### Request body (application/json)

**Body required**

- **title** `string` — Title of the custom menu
- **url** `string` — URL of the custom menu
- **icon** `object` — Icon information for the custom menu
- **showOnCompany** `boolean` — Whether the menu must be displayed on the agency's level

  **Default value:**

  `true`

- **showOnLocation** `boolean` — Whether the menu must be displayed for sub-accounts level

  **Default value:**

  `true`

- **showToAllLocations** `boolean` — Whether the menu must be displayed to all sub-accounts

  **Default value:**

  `true`

- **openMode** `string` — Mode for opening the menu link
  - Available options: `iframe`, `new_tab`, `current_tab`
- **locations** `string[]` — List of sub-account IDs where the menu should be shown. This list is applicable only when showOnLocation is true and showToAllLocations is false
- **userRole** `string` — Which user-roles should the menu be accessible to?
  - Available options: `all`, `admin`, `user`
- **allowCamera** `boolean` — Whether to allow camera access (only for iframe mode)
- **allowMicrophone** `boolean` — Whether to allow microphone access (only for iframe mode)

```json
{
  "title": "Custom Menu",
  "url": "https://custom-menus.com/",
  "icon": {
    "name": "yin-yang",
    "fontFamily": "fab"
  },
  "showOnCompany": true,
  "showOnLocation": true,
  "showToAllLocations": true,
  "openMode": "iframe",
  "locations": [
    "gfWreTIHL8pDbggBb7af",
    "67WreTIHL8pDbggBb7ty"
  ],
  "userRole": "all",
  "allowCamera": false,
  "allowMicrophone": false
}
```

### Response (200 · application/json)

Custom menu successfully updated

**Schema**

- **success** `boolean` — Status of update
- **customMenu** `object` — Updated custom menu link

```json
{
  "success": true,
  "customMenu": {
    "id": "12345",
    "icon": {
      "name": "yin-yang",
      "fontFamily": "fab"
    },
    "title": "Dashboard",
    "url": "/dashboard",
    "order": 1,
    "showOnCompany": true,
    "showOnLocation": true,
    "showToAllLocations": true,
    "locations": [
      "gfWreTIHL8pDbggBb7af",
      "67WreTIHL8pDbggBb7ty"
    ],
    "openMode": "iframe",
    "userRole": "all",
    "allowCamera": false,
    "allowMicrophone": false
  }
}
```
