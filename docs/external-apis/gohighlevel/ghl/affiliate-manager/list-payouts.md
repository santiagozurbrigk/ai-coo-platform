---
title: "List Payouts"
source: "https://marketplace.gohighlevel.com/docs/ghl/affiliate-manager/list-payouts"
seccion: "Affiliate Manager > Payouts > List Payouts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/affiliate-manager/:locationId/payouts"
---

# List Payouts

```http
GET /affiliate-manager/:locationId/payouts
```

Retrieve the list of payouts for a location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **status** `string` — Payout status
- **query** `string` — query
- **affiliateId** `string` — Affiliate Id
- **campaignId** `string` — Campaign Id
- **skip** `number`

  Default value:

  `0`

- **limit** `number`

  Default value:

  `10`

- **start** `string`
- **end** `string`

### Response (200 · application/json)

Successful response

**Schema**

- **payouts** `object[]` _required_ — Payout list
- **meta** `object` — Pagination metadata

```json
{
  "payouts": [
    {
      "_id": "65df04201e428a0c5ebb6571",
      "locationId": "ve9EPM428h8vShlRW1KT",
      "affiliateId": "65df04201e428a0c5ebb6572",
      "campaignId": "65df04201e428a0c5ebb6573",
      "currency": "USD",
      "amount": 150,
      "status": "pending",
      "payoutMonth": "2024-06-01T00:00:00.000Z",
      "dueAt": "2024-06-30T00:00:00.000Z",
      "paidAt": "2024-06-30T00:00:00.000Z",
      "paidMeta": {},
      "paidMethod": "manual",
      "altId": "alt_123",
      "deleted": false,
      "isMigrated": false,
      "createdAt": "2024-06-16T00:00:00.000Z",
      "updatedAt": "2024-06-17T00:00:00.000Z",
      "campaign": "Summer Promo",
      "affiliateName": "John Doe",
      "affiliateEmail": "[email protected]",
      "payoutMethod": "paypal",
      "affiliate": {
        "_id": "63d147176c5bbc30e9e091a4",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1 888 888-8888",
        "deleted": false,
        "locationId": "ve9EPM428h8vShlRW1KT",
        "active": true,
        "address": "123 Main St",
        "avatar": "https://example.com/avatar.png",
        "createdAt": "2024-06-16T00:00:00.000Z",
        "createdBy": {},
        "facebookUrl": "https://facebook.com/johndoe",
        "instagramUrl": "https://instagram.com/johndoe",
        "linkedInUrl": "https://linkedin.com/in/johndoe",
        "twitterUrl": "https://twitter.com/johndoe",
        "youtubeUrl": "https://youtube.com/channel",
        "websiteUrl": "https://example.com",
        "contactId": "ve9EPM428h8vShlRW1KT",
        "campaignIds": [
          "650173614761b33c46d33b19"
        ],
        "vatId": "VAT123",
        "updatedAt": "2024-06-16T00:00:00.000Z",
        "w8Form": "string",
        "w9Form": "string",
        "lastUpdatedBy": {},
        "email": "[email protected]",
        "revenue": 1250.5,
        "customer": 15,
        "lead": 5,
        "droppedCustomer": 2,
        "clickCount": 100,
        "paid": 500,
        "currency": "USD",
        "owned": 750
      }
    }
  ],
  "meta": {
    "count": 42
  }
}
```
