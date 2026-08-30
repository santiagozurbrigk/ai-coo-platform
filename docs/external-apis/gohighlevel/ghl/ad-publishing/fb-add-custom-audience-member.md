---
title: "Add custom audience member"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-add-custom-audience-member"
seccion: "Ad Manager > Facebook Ads > Add custom audience member"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/facebook/custom-audience/:audienceId/member"
---

# Add custom audience member

```http
PUT /ad-publishing/facebook/custom-audience/:audienceId/member
```

Add a single contact to a Facebook custom audience. The contact is resolved from `contactId` and its identifiers are hashed before being sent to Meta. Use the batch endpoint for more than one member.

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

Acknowledgement that the contact was added, naming the audience in `msg`

**Schema**

- **status** `number` _required_ — Always 200. Mirrors the HTTP status rather than reporting anything additional.
- **msg** `string` _required_ — Human-readable confirmation. Wording varies with the operation performed.

```json
{
  "status": 200,
  "msg": "Successfully updated audience"
}
```
