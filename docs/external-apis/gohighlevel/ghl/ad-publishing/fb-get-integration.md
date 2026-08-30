---
title: "Get Facebook integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-integration"
seccion: "Ad Manager > Facebook Integration > Get Facebook integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/integration"
---

# Get Facebook integration

```http
GET /ad-publishing/facebook/integration
```

Retrieve the Facebook ad integration details for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Facebook integration for the location. Includes a live access token per linked page.

**Schema**

- **locationId** `string` _required_ — Location identifier
- **status** `string` _required_ — Connection state
  - Available options: `connected`, `expired`, `disconnected`
- **pricingModel** `string` _required_ — How the location pays for ads
  - Available options: `done_for_you`, `connect_your_bm`
- **fbAdAccountId** `string` — Connected ad account id, prefixed with `act_`
- **fbBusinessId** `string` — Business Manager id. Absent on connect-your-BM integrations that have no business linked.
- **fbDefaultPageId** `string` — Page used by default when publishing
- **pages** `object[]` _required_ — Pages linked to the integration, each with its access token

```json
{
  "locationId": "g8EFf47NY6PxodNBEHzP",
  "status": "connected",
  "pricingModel": "connect_your_bm",
  "fbAdAccountId": "act_357046700569338",
  "fbBusinessId": "153049965367635",
  "fbDefaultPageId": "1180808591782587",
  "pages": [
    {
      "id": "196684453527082",
      "name": "Acme Restaurant",
      "accessToken": "<page-access-token>",
      "createdOn": "2026-08-14T07:54:16.206Z",
      "_id": "6a82addf630fffe07b9bedd7"
    }
  ]
}
```
