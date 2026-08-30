---
title: "Set default page"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-set-default-page"
seccion: "Ad Manager > Facebook Integration > Set default page"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/facebook/page/default"
---

# Set default page

```http
PUT /ad-publishing/facebook/page/default
```

Set the default Facebook page for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Request body (application/json)

**Body required**

- **pageId** `string` _required_ — Facebook page identifier

```json
{
  "pageId": "103456789012345"
}
```

### Response (200 · application/json)

Acknowledgement that the default page was set

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
