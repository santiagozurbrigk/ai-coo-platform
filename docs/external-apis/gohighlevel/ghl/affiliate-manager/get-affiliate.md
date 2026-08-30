---
title: "Get Affiliate"
source: "https://marketplace.gohighlevel.com/docs/ghl/affiliate-manager/get-affiliate"
seccion: "Affiliate Manager > Affiliates > Get Affiliate"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/affiliate-manager/:locationId/affiliates/:affiliateId"
---

# Get Affiliate

```http
GET /affiliate-manager/:locationId/affiliates/:affiliateId
```

Retrieve a single affiliate by id for a location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **affiliateId** `string` _required_ — Affiliate Id

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — Affiliate id
- **firstName** `string` — Affiliate first name
- **lastName** `string` — Affiliate last name
- **phone** `string` — Affiliate phone number
- **deleted** `boolean` — Whether the affiliate is deleted
- **locationId** `string` _required_ — Location id
- **active** `boolean` — Whether the affiliate is active
- **address** `string` — Affiliate address
- **avatar** `string` — Affiliate avatar URL
- **createdAt** `string` — Created at timestamp
- **createdBy** `object` — Created by audit info
- **facebookUrl** `string` — Facebook URL
- **instagramUrl** `string` — Instagram URL
- **linkedInUrl** `string` — LinkedIn URL
- **twitterUrl** `string` — Twitter URL
- **youtubeUrl** `string` — YouTube URL
- **websiteUrl** `string` — Website URL
- **contactId** `string` — Contact id associated with the affiliate
- **campaignIds** `string[]` — Campaign ids
- **vatId** `string` — VAT ID
- **updatedAt** `string` — Updated at timestamp
- **w8Form** `string` — W8 form URL
- **w9Form** `string` — W9 form URL
- **lastUpdatedBy** `object` — Last updated by audit info
- **email** `string` _required_ — Affiliate email
- **revenue** `number` — Affiliate revenue
- **customer** `number` — Customer count
- **lead** `number` — Lead count
- **droppedCustomer** `number` — Dropped customer count
- **clickCount** `number` — Click count
- **paid** `number` — Paid amount
- **currency** `string` — Currency code
- **owned** `number` — Owned amount

```json
{
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
```
