---
title: "Create Google integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-create-integration"
seccion: "Ad Manager > Google Integration > Create Google integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/google/integration"
---

# Create Google integration

```http
POST /ad-publishing/google/integration
```

Create a Google Ads integration for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **adAccountId** `string` _required_ — Ad account identifier
- **mccId** `string` _required_ — MCC identifier

```json
{
  "locationId": "loc_abc123",
  "adAccountId": "123-456-7890",
  "mccId": "987-654-3210"
}
```

### Response (200 · application/json)

The stored integration. Returns the raw document, so the id is `_id`.

**Schema**

- **_id** `string` _required_ — Integration identifier, as `_id` rather than `id`
- **__v** `number` _required_ — Mongoose internal version key
- **locationId** `string` _required_ — Location identifier
- **status** `string` _required_ — Connection state
  - Available options: `connected`, `expired`, `disconnected`
- **adAccountId** `string` _required_ — Connected Google Ads customer id
- **mccId** `string` _required_ — Manager (MCC) customer id above the account
- **userId** `string` _required_ — Google People API resource name of the connected user
- **connectionId** `string` _required_ — Identifier of the OAuth connection backing this integration
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "_id": "677ebaed998e79ec25fc612b",
  "__v": 0,
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "status": "connected",
  "adAccountId": "6776452901",
  "mccId": "6776452901",
  "userId": "people/1154723318699",
  "connectionId": "gZddldBd8SWA7C",
  "createdAt": "2025-01-08T17:50:37.952Z",
  "updatedAt": "2026-08-19T08:12:05.304Z"
}
```
