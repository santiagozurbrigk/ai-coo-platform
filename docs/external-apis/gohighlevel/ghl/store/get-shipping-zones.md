---
title: "Get Shipping Zone"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/get-shipping-zones"
seccion: "Store > Shipping Zone > Get Shipping Zone"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/store/shipping-zone/:shippingZoneId"
---

# Get Shipping Zone

```http
GET /store/shipping-zone/:shippingZoneId
```

The "List Shipping Zone" API allows to retrieve a paginated list of shipping zone.

## Request

### Path parameters

- **shippingZoneId** `string` _required_ — ID of the item that needs to be returned

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **withShippingRate** `boolean` — Include shipping rates array

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
    "countries": [
      {
        "code": "US",
        "states": [
          {
            "code": "VA"
          }
        ]
      }
    ],
    "_id": "655b33a82209e60b6adb87a5",
    "shippingRates": [
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
        ],
        "_id": "655b33a82209e60b6adb87a5",
        "shippingZoneId": "655b33a82209e60b6adb87a5",
        "createdAt": "2023-12-12T09:27:42.355Z",
        "updatedAt": "2023-12-12T09:27:42.355Z"
      }
    ],
    "createdAt": "2023-12-12T09:27:42.355Z",
    "updatedAt": "2023-12-12T09:27:42.355Z"
  }
}
```
