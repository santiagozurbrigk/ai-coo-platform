---
title: "Get Custom Menu Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/custom-menus/get-custom-menu-by-id"
seccion: "Custom menus > Custom Menu Links > Get Custom Menu Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/custom-menus/:customMenuId"
---

# Get Custom Menu Link

```http
GET /custom-menus/:customMenuId
```

Fetches a single custom menus based on id. This endpoint allows clients to retrieve custom menu configurations, which may include menu items, categories, and associated metadata

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **customMenuId** `string` _required_ — Unique identifier of the custom menu

### Response (200 · application/json)

Successfully retrieved custom menu. Returns a single custom menu object, potentially including its structure, items, and relevant metadata.

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
