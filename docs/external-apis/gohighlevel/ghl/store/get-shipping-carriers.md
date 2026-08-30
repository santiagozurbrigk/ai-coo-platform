---
title: "Get Shipping Carrier"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/get-shipping-carriers"
seccion: "Store > Shipping Carrier > Get Shipping Carrier"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/store/shipping-carrier/:shippingCarrierId"
---

# Get Shipping Carrier

```http
GET /store/shipping-carrier/:shippingCarrierId
```

The "List Shipping Carrier" API allows to retrieve a paginated list of shipping carrier.

## Request

### Path parameters

- **shippingCarrierId** `string` _required_ — ID of the shipping carrier that needs to be returned

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message
- **data** `object` _required_ — Shipping carrier data

```json
{
  "status": true,
  "message": "Successfully created",
  "data": {
    "altId": "6578278e879ad2646715ba9c",
    "altType": "location",
    "name": "FedEx",
    "callbackUrl": "https://example.com/get-shipping-rates",
    "services": [
      {
        "name": "Priority Mail Express International",
        "value": "PriorityMailExpressInternational"
      }
    ],
    "allowsMultipleServiceSelection": true,
    "_id": "655b33a82209e60b6adb87a5",
    "marketplaceAppId": "655b33a82209e60b6adb87a5",
    "createdAt": "2023-12-12T09:27:42.355Z",
    "updatedAt": "2023-12-12T09:27:42.355Z"
  }
}
```
