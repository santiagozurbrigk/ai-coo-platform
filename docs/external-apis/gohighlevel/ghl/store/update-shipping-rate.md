---
title: "Update Shipping Rate"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/update-shipping-rate"
seccion: "Store > Shipping Zone Rates > Update Shipping Rate"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId"
---

# Update Shipping Rate

```http
PUT /store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId
```

The "update Shipping Rate" API allows update a shipping rate to the system.

## Request

### Path parameters

- **shippingZoneId** `string` _required_ — ID of the shipping zone
- **shippingRateId** `string` _required_ — ID of the shipping rate that needs to be returned

### Request body (application/json)

**Body required**

- **altId** `string` — Location Id or Agency Id
- **altType** `string`
  - Available options: `location`
- **name** `string` — Name of the shipping zone
- **description** `string` — Delivery description
- **currency** `string` — The currency of the amount of the rate / handling fee
- **amount** `number` — The amount of the shipping rate if it is normal rate (0 means free ). Fixed Handling fee if it is a carrier rate (it will add to the carrier rate).
- **conditionType** `string` — Type of condition to provide the conditional pricing
  - Available options: `none`, `price`, `weight`
- **minCondition** `number` — Minimum condition for applying this price. set 0 or null if there is no minimum
- **maxCondition** `number` — Maximum condition for applying this price. set 0 or null if there is no maximum
- **isCarrierRate** `boolean` — is this a carrier rate
- **shippingCarrierId** `string` — Shipping carrier id
- **percentageOfRateFee** `number` — Percentage of rate fee if it is a carrier rate.
- **shippingCarrierServices** `object[]` — An array of items

```json
{
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
  ]
}
```

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
