---
title: "Create a new wallet charge"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/charge"
seccion: "Developer marketplace > Wallet Charges > Create a new wallet charge"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/marketplace/billing/charges"
---

# Create a new wallet charge

```http
POST /marketplace/billing/charges
```

Create a new wallet charge

## Request

### Request body (application/json)

**Body required**

- **appId** `string` _required_ — App ID of the App
- **meterId** `string` _required_ — Billing Meter ID (you can find this on your app's pricing page)
- **eventId** `string` _required_ — Event ID / Transaction ID on your server's side. This will help you maintain the reference of the event/transaction on your end that you charged the customer for.
- **userId** `string` — User ID
- **locationId** `string` _required_ — ID of the Sub-Account to be charged
- **companyId** `string` _required_ — ID of the Agency the Sub-account belongs to
- **description** `string` _required_ — Description of the charge
- **price** `number` — Price per unit to charge
- **units** `number` _required_ — Number of units to charge
- **eventTime** `string` — The timestamp when the event/transaction was performed. If blank, the billing timestamp will be set as the event time. ISO8601 Format.

```json
{
  "appId": "6578278e879ad2646715ba9c",
  "meterId": "680b97022b4a34420f5f9b93",
  "eventId": "evt_abc123",
  "userId": "user_abc123",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "companyId": "company_abc123",
  "description": "Charge for sending 10 SMS messages",
  "price": 0.01,
  "units": 10,
  "eventTime": "2025-03-26T00:00:000Z"
}
```

### Response (201 · application/json)

Charge created successfully

**Schema**

- **success** `boolean` — Indicates whether the charge was created successfully
- **chargeId** `string` — Unique identifier of the created charge

```json
{
  "success": true,
  "chargeId": "charge_123"
}
```
