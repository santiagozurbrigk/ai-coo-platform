---
title: "Create Custom Menu Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-menus/create-custom-menu"
seccion: "Custom menus > Custom Menu Links > Create Custom Menu Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/custom-menus/"
---

# Create Custom Menu Link

```http
POST /custom-menus/
```

Creates a new custom menu for a company. Requires authentication and proper permissions. For Icon Usage Details please refer to [https://doc.clickup.com/8631005/d/h/87cpx-243696/d60fa70db6b92b2](https://doc.clickup.com/8631005/d/h/87cpx-243696/d60fa70db6b92b2)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **title** `string` _required_ — Title of the custom menu
- **url** `string` _required_ — URL of the custom menu
- **icon** `object` _required_ — Icon information for the custom menu
- **showOnCompany** `boolean` _required_ — Whether the menu must be displayed on the agency's level

  **Default value:**

  `true`

- **showOnLocation** `boolean` _required_ — Whether the menu must be displayed for sub-accounts level

  **Default value:**

  `true`

- **showToAllLocations** `boolean` _required_ — Whether the menu must be displayed to all sub-accounts

  **Default value:**

  `true`

- **openMode** `string` _required_ — Mode for opening the menu link
  - Available options: `iframe`, `new_tab`, `current_tab`
- **locations** `string[]` _required_ — List of sub-account IDs where the menu should be shown. This list is applicable only when showOnLocation is true and showToAllLocations is false
- **userRole** `string` _required_ — Which user-roles should the menu be accessible to?
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

### Response (201 · application/json)

Custom menu successfully created

**Schema**

- **customMenu** `object` — Single Custom menu link object

```json
{
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
