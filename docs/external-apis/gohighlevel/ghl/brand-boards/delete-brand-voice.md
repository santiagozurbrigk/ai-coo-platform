---
title: "Delete Brand Voice"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/delete-brand-voice"
seccion: "Brand Boards > Brand Voices > Delete Brand Voice"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/brand-boards/locations/:locationId/brand-voices/:brandVoiceId"
---

# Delete Brand Voice

```http
DELETE /brand-boards/locations/:locationId/brand-voices/:brandVoiceId
```

Delete a brand voice by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **brandVoiceId** `string` _required_ — Brand voice ID

### Response (200 · application/json)

Success

**Schema**

- **deleted** `boolean` _required_ — Whether the brand voice is deleted
- **traceId** `string` — Trace ID of request

```json
{
  "deleted": true,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
