---
title: "Delete custom audience"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-custom-audience"
seccion: "Ad Manager > Facebook Ads > Delete custom audience"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/facebook/custom-audience/:audienceId"
---

# Delete custom audience

```http
DELETE /ad-publishing/facebook/custom-audience/:audienceId
```

Delete a Facebook custom audience by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **audienceId** `string` _required_ — Custom audience identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Acknowledgement that the custom audience was deleted

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
