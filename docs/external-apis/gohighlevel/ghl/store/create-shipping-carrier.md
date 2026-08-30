---
title: "Create Shipping Carrier"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/create-shipping-carrier"
seccion: "Store > Shipping Carrier > Create Shipping Carrier"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/store/shipping-carrier"
---

# Create Shipping Carrier

```http
POST /store/shipping-carrier
```

The "Create Shipping Carrier" API allows adding a new shipping carrier.

## Request

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **name** `string` _required_ — Name of the shipping carrier
- **callbackUrl** `string` _required_ — The URL endpoint that CRM needs to retrieve shipping rates. This must be a public URL.
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

### Response (201 · application/json)

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
