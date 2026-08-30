---
title: "App Payment Status"
source: "https://marketplace.gohighlevel.com/docs/webhook/AppPaymentStatus"
seccion: "Webhook > AppPaymentStatus"
api_version: "v3"
capturado: "2026-08-30"
---

# App Payment Status

Called whenever the payment status of a paid app subscription changes — for example when a recurring payment fails during dunning, or when a previously failed payment is successfully recovered.

#### Schema

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "example": "APP_PAYMENT_STATUS"
    },
    "appId": {
      "type": "string",
      "example": "ve9EPM428h8vShlRW1KT"
    },
    "locationId": {
      "type": "string",
      "example": "otg8dTQqGLh3Q6iQI55w"
    },
    "companyId": {
      "type": "string",
      "example": "otg8dTQqGLh3Q6iQI55w"
    },
    "userId": {
      "type": "string",
      "example": "otg8dTQqGLh3Q6iQI55w"
    },
    "previousStatus": {
      "type": "string",
      "enum": ["COMPLETE", "FAILED", "PENDING"]
    },
    "newStatus": {
      "type": "string",
      "enum": ["COMPLETE", "FAILED", "PENDING"]
    }
  }
}
```

- Note: For agency (company) level apps `locationId` may be absent. `userId` may be `null` if the associated user cannot be resolved.

#### Example

- Payment failed

```json
{
  "type": "APP_PAYMENT_STATUS",
  "appId": "ve9EPM428h8vShlRW1KT",
  "locationId": "otg8dTQqGLh3Q6iQI55w",
  "companyId": "otg8dTQqGLh3Q6iQI55w",
  "userId": "otg8dTQqGLh3Q6iQI55w",
  "previousStatus": "COMPLETE",
  "newStatus": "FAILED"
}
```

- Payment recovered

```json
{
  "type": "APP_PAYMENT_STATUS",
  "appId": "ve9EPM428h8vShlRW1KT",
  "locationId": "otg8dTQqGLh3Q6iQI55w",
  "companyId": "otg8dTQqGLh3Q6iQI55w",
  "userId": "otg8dTQqGLh3Q6iQI55w",
  "previousStatus": "FAILED",
  "newStatus": "COMPLETE"
}
```
