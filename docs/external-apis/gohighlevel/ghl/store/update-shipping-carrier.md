---
title: "Update Shipping Carrier"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/update-shipping-carrier"
seccion: "Store > Shipping Carrier > Update Shipping Carrier"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/store/shipping-carrier/:shippingCarrierId"
---

# Update Shipping Carrier

```http
PUT /store/shipping-carrier/:shippingCarrierId
```

The "update Shipping Carrier" API allows update a shipping carrier to the system.

## Request

### Path parameters

- **shippingCarrierId** `string` _required_ — ID of the shipping carrier that needs to be returned

### Request body (application/json)

**Body required**

- **altId** `string` — Location Id or Agency Id
- **altType** `string`
  - Available options: `location`
- **name** `string` — Name of the shipping carrier
- **callbackUrl** `string` — The URL endpoint that CRM needs to retrieve shipping rates. This must be a public URL.
- **services** `object[]` — An array of available shipping carrier services
- **allowsMultipleServiceSelection** `boolean` — The seller can choose multiple services while creating shipping rates if this is true.

```json
{
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
  "allowsMultipleServiceSelection": true
}
```

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
