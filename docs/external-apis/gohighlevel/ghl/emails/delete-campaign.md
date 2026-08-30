---
title: "Delete Campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/delete-campaign"
seccion: "Email > Campaigns > Delete Campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/emails/locations/:locationId/campaigns/emails/:campaignId"
---

# Delete Campaign

```http
DELETE /emails/locations/:locationId/campaigns/emails/:campaignId
```

Delete a campaign

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **campaignId** `string` _required_ — Campaign ID

### Response (200 · application/json)

Success

**Schema**

- **deleted** `boolean` _required_ — Whether the campaign was deleted successfully
- **traceId** `string` — Trace ID of the request

```json
{
  "deleted": true,
  "traceId": "0c52e980-41f6-4be7-8c4b-32332ss"
}
```
