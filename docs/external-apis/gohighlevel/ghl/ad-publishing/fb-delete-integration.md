---
title: "Delete Facebook integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-integration"
seccion: "Ad Manager > Facebook Integration > Delete Facebook integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/facebook/integration"
---

# Delete Facebook integration

```http
DELETE /ad-publishing/facebook/integration
```

Remove the Facebook ad integration from a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe"
}
```

### Response (200 · application/json)

Acknowledgement that the integration was removed

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
