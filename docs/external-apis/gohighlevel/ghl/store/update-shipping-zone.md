---
title: "Update Shipping Zone"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/update-shipping-zone"
seccion: "Store > Shipping Zone > Update Shipping Zone"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/store/shipping-zone/:shippingZoneId"
---

# Update Shipping Zone

```http
PUT /store/shipping-zone/:shippingZoneId
```

The "update Shipping Zone" API allows update a shipping zone to the system.

## Request

### Path parameters

- **shippingZoneId** `string` _required_ — ID of the item that needs to be returned

### Request body (application/json)

**Body required**

- **altId** `string` — Location Id or Agency Id
- **altType** `string`
  - Available options: `location`
- **name** `string` — Name of the shipping zone
- **countries** `object[]` — List of countries that are available

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
