---
title: "Remove custom audience member"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-remove-custom-audience-member"
seccion: "Ad Manager > Facebook Ads > Remove custom audience member"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/facebook/custom-audience/:audienceId/member"
---

# Remove custom audience member

```http
DELETE /ad-publishing/facebook/custom-audience/:audienceId/member
```

Remove a single contact from a Facebook custom audience. Note this DELETE takes a request body carrying `locationId` and `contactId`, rather than identifying the member through the path or query.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **audienceId** `string` _required_ — Custom audience identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **contactId** `string` _required_ — Contact identifier
- **fbAdAccountId** `string` — Facebook ad account ID

```json
{
  "locationId": "loc_abc123",
  "contactId": "contact_123",
  "fbAdAccountId": "act_123456"
}
```

### Response (200 · application/json)

Acknowledgement that the contact was removed, naming the audience in `msg`

**Schema**

- **status** `number` _required_ — Always 200. Mirrors the HTTP status rather than reporting anything additional.
- **msg** `string` _required_ — Human-readable confirmation. Wording varies with the operation performed.

```json
{
  "status": 200,
  "msg": "Successfully updated audience"
}
```
