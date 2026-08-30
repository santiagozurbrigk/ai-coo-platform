---
title: "Create Shipping Rate"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/create-shipping-rate"
seccion: "Store > Shipping Zone Rates > Create Shipping Rate"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/store/shipping-zone/:shippingZoneId/shipping-rate"
---

# Create Shipping Rate

```http
POST /store/shipping-zone/:shippingZoneId/shipping-rate
```

The "Create Shipping Rate" API allows adding a new shipping rate.

## Request

### Path parameters

- **shippingZoneId** `string` _required_ — ID of the item that needs to be returned

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **name** `string` _required_ — Name of the shipping zone
- **description** `string` — Delivery description
- **currency** `string` _required_ — The currency of the amount of the rate / handling fee
- **amount** `number` _required_ — The amount of the shipping rate if it is normal rate (0 means free ). Fixed Handling fee if it is a carrier rate (it will add to the carrier rate).
- **conditionType** `string` _required_ — Type of condition to provide the conditional pricing
  - Available options: `none`, `price`, `weight`
- **minCondition** `number` _required_ — Minimum condition for applying this price. set 0 or null if there is no minimum
- **maxCondition** `number` _required_ — Maximum condition for applying this price. set 0 or null if there is no maximum
- **isCarrierRate** `boolean` — is this a carrier rate
- **shippingCarrierId** `string` _required_ — Shipping carrier id
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

### Response (201 · application/json)

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
