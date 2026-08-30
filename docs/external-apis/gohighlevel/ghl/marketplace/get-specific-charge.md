---
title: "Get specific wallet charge details"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/get-specific-charge"
seccion: "Developer marketplace > Wallet Charges > Get specific wallet charge details"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/marketplace/billing/charges/:chargeId"
---

# Get specific wallet charge details

```http
GET /marketplace/billing/charges/:chargeId
```

Get specific wallet charge details

## Request

### Path parameters

- **chargeId** `string` _required_ — ID of the charge to retrieve

### Response (200 · application/json)

Returns charge details

**Schema**

- **refunded** `boolean` — Value is 'true' if the charge has subsequently been refunded.
- **currency** `string` — Currency of the transaction. We currently support USD only.
- **appId** `string` — App ID
- **meterId** `string` — Billing Meter ID (you can find this on your app's pricing page)
- **chargeId** `string` — Charge ID
- **entityType** `string` — Indicates who was charged? Currently, we support charges for 'location' only
- **entityId** `string` — If the entityType is Location, entityld would be locationld.
- **amountCharged** `number` — Total amount charged
- **pricePerUnit** `number` — Price per unit for the charge
- **transactionType** `string` — This can be one of two values - 'charge' or 'refund'
- **units** `number` — Number of units that the sub-account was charged for
- **meta** `object` — meta object contains details that were sent while creating the charge via the API - eventID, description, eventTime, userld
- **createdAt** `string<date-time>` — Timestamp when the charge was created in our system
- **updatedAt** `string<date-time>` — Timestamp when the charge was last updated in our system

```json
{
  "refunded": false,
  "currency": "USD",
  "appId": "6578278e879ad2646715ba9c",
  "meterId": "680b97022b4a34420f5f9b93",
  "chargeId": "charge_123",
  "entityType": "location",
  "entityId": "ve9EPM428h8vShlRW1KT",
  "amountCharged": 0.1,
  "pricePerUnit": 0.01,
  "transactionType": "charge",
  "units": 10,
  "meta": {
    "eventId": "evt_abc123",
    "description": "Charge for 10 SMS messages"
  },
  "createdAt": "2025-03-26T00:00:00.000Z",
  "updatedAt": "2025-03-26T00:00:00.000Z"
}
```
