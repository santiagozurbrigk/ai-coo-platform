---
title: "Update custom audience"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-update-custom-audience"
seccion: "Ad Manager > Facebook Ads > Update custom audience"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/facebook/custom-audience/:audienceId"
---

# Update custom audience

```http
PUT /ad-publishing/facebook/custom-audience/:audienceId
```

Rename a Facebook custom audience or change its description. Only those two fields can be updated; membership is changed through the member endpoints. The audience is also queued for reprocessing, so the acknowledgement does not mean downstream state has caught up.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **audienceId** `string` _required_ — Custom audience identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **name** `string` _required_ — Audience name
- **description** `string` — Audience description

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe",
  "name": "My Custom Audience",
  "description": "Lookalike audience from website visitors"
}
```

### Response (200 · application/json)

Acknowledgement that the audience was updated

**Schema**

- **status** `number` _required_ — Always 200. Mirrors the HTTP status rather than reporting anything additional.
- **msg** `string` _required_ — Human-readable confirmation. Wording varies with the operation performed.

```json
{
  "status": 200,
  "msg": "Successfully updated audience"
}
```
