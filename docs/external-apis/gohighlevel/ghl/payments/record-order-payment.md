---
title: "Record Order Payment"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/record-order-payment"
seccion: "Payments > Orders > Record Order Payment"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/payments/orders/:orderId/record-payment"
---

# Record Order Payment

```http
POST /payments/orders/:orderId/record-payment
```

The "Record Order Payment" API allows to record a payment for an order. Use this endpoint to record payment for an order and update the order status to "Paid".

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **orderId** `string` _required_ — Order ID

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **mode** `string` _required_ — manual payment method
  - Available options: `cash`, `card`, `cheque`, `bank_transfer`, `other`
- **card** `object` — Details of Card if used for payment
- **cheque** `object` — Details of the Cheque if used for payment
- **notes** `string` — Any note to be recorded with the transaction
- **amount** `number` — Amount to be paid against the invoice.
- **meta** `object` — Meta data to be recorded with the transaction
- **isPartialPayment** `boolean` — Indicates if the order is intended to be a partial payment.

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "mode": "card",
  "card": {
    "type": "mastercard",
    "last4": "1234"
  },
  "cheque": {
    "number": "129-129-129-912"
  },
  "notes": "This was a direct payment",
  "amount": 100,
  "meta": {},
  "isPartialPayment": true
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success status of the request

```json
{
  "success": true
}
```
