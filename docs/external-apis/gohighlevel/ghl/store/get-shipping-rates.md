---
title: "Get Shipping Rate"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/get-shipping-rates"
seccion: "Store > Shipping Zone Rates > Get Shipping Rate"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId"
---

# Get Shipping Rate

```http
GET /store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId
```

The "List Shipping Rate" API allows to retrieve a paginated list of shipping rate.

## Request

### Path parameters

- **shippingZoneId** `string` _required_ — ID of the shipping zone
- **shippingRateId** `string` _required_ — ID of the shipping rate that needs to be returned

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message
- **data** `object` _required_ — Shipping zone data

```json
{
  "status": true,
  "message": "Successfully created",
  "data": {
    "altId": "6578278e879ad2646715ba9c",
    "altType": "location",
    "name": "North zone",
    "description": "Ships next day",
    "currency": "USD",
    "amount": 99.99,
    "conditionType": "price",
    "minCondition": 99.99,
    "maxCondition": 99.99,
    "isCarrierRate": true,
    "shippingCarrierId": "655b33a82209e60b6adb87a5",
    "percentageOfRateFee": 10.99,
    "shippingCarrierServices": [
      {
        "name": "Priority Mail Express International",
        "value": "PriorityMailExpressInternational"
      }
    ],
    "_id": "655b33a82209e60b6adb87a5",
    "shippingZoneId": "655b33a82209e60b6adb87a5",
    "createdAt": "2023-12-12T09:27:42.355Z",
    "updatedAt": "2023-12-12T09:27:42.355Z"
  }
}
```
