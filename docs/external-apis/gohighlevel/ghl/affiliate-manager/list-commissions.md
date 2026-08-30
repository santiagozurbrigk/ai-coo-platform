---
title: "List Commissions"
source: "https://marketplace.gohighlevel.com/docs/ghl/affiliate-manager/list-commissions"
seccion: "Affiliate Manager > Commissions > List Commissions"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/affiliate-manager/:locationId/commissions"
---

# List Commissions

```http
GET /affiliate-manager/:locationId/commissions
```

Retrieve the list of commissions for a location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **campaignId** `string` — Campaign Id
- **affiliateId** `string` — Affiliate Id
- **status** `string` — Status
- **query** `string` — Query
- **skip** `number`

  Default value:

  `0`

- **limit** `number` — Maximum number of records to return. Maximum allowed value is 100.

  Default value:

  `10`

- **fromDate** `string`
- **toDate** `string`

### Response (200 · application/json)

Successful response

**Schema**

- **commissions** `object[]` _required_ — Commission list
- **meta** `object` — Pagination metadata

```json
{
  "commissions": [
    {
      "_id": "6385d230f6d19db03eef6fb2",
      "productId": "6385d230f6d19db03eef6fb2",
      "productName": "Basic Plan",
      "qty": 1,
      "productCommission": 25,
      "commissionAmount": 25,
      "amount": 100,
      "unitDiscount": 5,
      "campaignName": "Summer Promo",
      "commission": 25,
      "commissionType": "percentage",
      "transactionAt": "2024-06-16T00:00:00.000Z",
      "transactionId": "txn_123",
      "affiliateId": "6385d230f6d19db03eef6fb2",
      "payoutId": "6385d230f6d19db03eef6fb2",
      "status": "pending",
      "currency": "USD",
      "isTrial": false,
      "customer": {
        "_id": "6385d230f6d19db03eef6fb2",
        "firstName": "John",
        "lastName": "Doe",
        "email": "[email protected]",
        "type": "customer"
      },
      "createdAt": "2024-06-16T00:00:00.000Z",
      "eventId": "evt_123",
      "campaign": {
        "id": "6385d230f6d19db03eef6fb2",
        "name": "Summer Promo",
        "liveMode": true
      },
      "affiliate": {
        "_id": "6385d230f6d19db03eef6fb2",
        "name": "John Doe",
        "email": "[email protected]"
      },
      "dueAt": "2024-06-30T00:00:00.000Z",
      "liveMode": true,
      "tier": 1
    }
  ],
  "meta": {
    "count": 42
  }
}
```
