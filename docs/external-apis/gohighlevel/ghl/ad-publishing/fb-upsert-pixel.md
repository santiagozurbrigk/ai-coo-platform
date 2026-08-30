---
title: "Upsert conversion pixel"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-upsert-pixel"
seccion: "Ad Manager > Facebook Ads > Upsert conversion pixel"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/facebook/pixels"
---

# Upsert conversion pixel

```http
PUT /ad-publishing/facebook/pixels
```

Create a Facebook conversion pixel, or rename an existing one by passing `conversionPixelId`. The two paths acknowledge differently: a create returns the new id, a rename returns only `{ success: true }`. Renaming is the only update supported, and it rejects `type: INSTAGRAM_DM`. Creating an `INSTAGRAM_DM` dataset requires `igUserId` and fails if one already exists for that account.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **conversionPixelId** `string` — Conversion pixel ID
- **name** `string` — Pixel name
- **igUserId** `string` — Instagram user ID
- **type** `string` _required_ — Pixel event type
  - Available options: `LEAD_EVENT`, `FUNNEL_EVENT`, `INSTAGRAM_DM`

```json
{
  "locationId": "loc_abc123",
  "conversionPixelId": "px_123",
  "name": "My Pixel",
  "igUserId": "ig_user_123",
  "type": "LEAD_EVENT"
}
```

### Response (200 · application/json)

The new id when a pixel was created, or a success flag when an existing pixel was renamed

**Schema**

oneOf

- **id** `string` _required_ — Id of the pixel or dataset that was created

```json
{
  "id": "1712619223343735"
}
```
