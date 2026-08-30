---
title: "Set Default Brand Voice"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/set-default-brand-voice"
seccion: "Brand Boards > Brand Voices > Set Default Brand Voice"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/brand-boards/locations/:locationId/brand-voices/:brandVoiceId/default"
---

# Set Default Brand Voice

```http
POST /brand-boards/locations/:locationId/brand-voices/:brandVoiceId/default
```

Set a brand voice as the default for a location. The previous default will be unset.

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

- **success** `boolean` _required_ — Whether the operation was successful
- **brandVoiceId** `string` _required_ — Brand voice ID that was set as default
- **traceId** `string` — Trace ID of request

```json
{
  "success": true,
  "brandVoiceId": "507f1f77bcf86cd799439011",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
