---
title: "Delete campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-campaign"
seccion: "Ad Manager > Facebook Ads > Delete campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/facebook/campaigns/:campaignId"
---

# Delete campaign

```http
DELETE /ad-publishing/facebook/campaigns/:campaignId
```

Delete a Facebook campaign by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **campaignId** `string` _required_ — Campaign identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe"
}
```

### Response (200 · application/json)

Acknowledgement that the campaign was deleted

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
