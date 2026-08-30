---
title: "List Shipping Zones"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/list-shipping-zones"
seccion: "Store > Shipping Zone > List Shipping Zones"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/store/shipping-zone"
---

# List Shipping Zones

```http
GET /store/shipping-zone
```

The "List Shipping Zone" API allows to retrieve a list of shipping zone.

## Request

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `0`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

- **withShippingRate** `boolean` — Include shipping rates array

### Response (200 · application/json)

Successful response

**Schema**

- **total** `number` _required_ — Total number of items
- **data** `object[]` _required_ — An array of items

```json
{
  "total": 20,
  "data": [
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
  ]
}
```
