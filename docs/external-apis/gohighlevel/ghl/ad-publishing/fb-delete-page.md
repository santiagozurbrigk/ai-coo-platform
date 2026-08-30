---
title: "Delete page connection"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-page"
seccion: "Ad Manager > Facebook Integration > Delete page connection"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/facebook/page"
---

# Delete page connection

```http
DELETE /ad-publishing/facebook/page
```

Remove a Facebook page connection from a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **pageId** `string` _required_ — Facebook page ID

### Response (200 · application/json)

Acknowledgement that the page was disconnected

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
