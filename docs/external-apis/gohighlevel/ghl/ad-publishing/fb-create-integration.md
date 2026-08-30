---
title: "Create Facebook integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-create-integration"
seccion: "Ad Manager > Facebook Integration > Create Facebook integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/facebook/integration"
---

# Create Facebook integration

```http
POST /ad-publishing/facebook/integration
```

Create a Facebook ad integration for a location with page and ad account

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **pageId** `string` _required_ — Facebook page ID
- **adAccountId** `string` — Ad account identifier

```json
{
  "locationId": "loc_abc123",
  "pageId": "123456789",
  "adAccountId": "act_123456"
}
```

### Response (200 · application/json)

The stored integration. Broader than the read — also returns the top-level `userAccessToken`.

**Schema**

- **id** `string` _required_ — Integration identifier
- **locationId** `string` _required_ — Location identifier
- **status** `string` _required_ — Connection state
  - Available options: `connected`, `expired`, `disconnected`
- **pricingModel** `string` _required_ — How the location pays for ads
  - Available options: `done_for_you`, `connect_your_bm`
- **userAccessToken** `string` _required_ — Live user access token for the connected Facebook user. Treat as a credential.
- **fbAdAccountId** `string` — Connected ad account id
- **fbDefaultPageId** `string` — Page used by default when publishing
- **pages** `object[]` _required_ — Pages linked to the integration, each with its access token
- **unSubscriptionReasons** `string[]` _required_ — Reasons the location previously unsubscribed. Empty array when none.
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "id": "68b6e9577058423e35c3c358",
  "locationId": "g8EFf47NY6PxodNBEHzP",
  "status": "connected",
  "pricingModel": "connect_your_bm",
  "userAccessToken": "<user-access-token>",
  "fbAdAccountId": "act_357046700569338",
  "fbDefaultPageId": "1180808591782587",
  "pages": [
    {
      "id": "196684453527082",
      "name": "Acme Restaurant",
      "accessToken": "<page-access-token>",
      "createdOn": "2026-08-14T07:54:16.206Z",
      "_id": "6a82addf630fffe07b9bedd7"
    }
  ],
  "unSubscriptionReasons": [],
  "createdAt": "2025-09-02T12:55:51.522Z",
  "updatedAt": "2026-08-19T12:03:39.896Z"
}
```
