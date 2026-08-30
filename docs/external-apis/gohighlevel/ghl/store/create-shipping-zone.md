---
title: "Create Shipping Zone"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/create-shipping-zone"
seccion: "Store > Shipping Zone > Create Shipping Zone"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/store/shipping-zone"
---

# Create Shipping Zone

```http
POST /store/shipping-zone
```

The "Create Shipping Zone" API allows adding a new shipping zone.

## Request

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **name** `string` _required_ — Name of the shipping zone
- **countries** `object[]` _required_ — List of countries that are available

```json
{
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
