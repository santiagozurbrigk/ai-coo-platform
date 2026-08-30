---
title: "List Shipping Carriers"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/list-shipping-carriers"
seccion: "Store > Shipping Carrier > List Shipping Carriers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/store/shipping-carrier"
---

# List Shipping Carriers

```http
GET /store/shipping-carrier
```

The "List Shipping Carrier" API allows to retrieve a list of shipping carrier.

## Request

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message
- **data** `object[]` _required_ — An array of items

```json
{
  "status": true,
  "message": "Successfully created",
  "data": [
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
      "allowsMultipleServiceSelection": true,
      "_id": "655b33a82209e60b6adb87a5",
      "marketplaceAppId": "655b33a82209e60b6adb87a5",
      "createdAt": "2023-12-12T09:27:42.355Z",
      "updatedAt": "2023-12-12T09:27:42.355Z"
    }
  ]
}
```
