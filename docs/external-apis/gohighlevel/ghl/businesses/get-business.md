---
title: "Get Business"
source: "https://marketplace.gohighlevel.com/docs/ghl/businesses/get-business"
seccion: "Business > Businesses > Get Business"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/businesses/:businessId"
---

# Get Business

```http
GET /businesses/:businessId
```

Get Business

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **businessId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **business** `object` _required_ — Business Response

```json
{
  "business": {
    "id": "63771dcac1116f0e21de8e12",
    "name": "Microsoft",
    "phone": "string",
    "email": "[email protected]",
    "website": "microsoft.com",
    "address": "string",
    "city": "string",
    "description": "string",
    "state": "string",
    "postalCode": "string",
    "country": "united states",
    "updatedBy": {},
    "locationId": "string",
    "createdBy": {},
    "createdAt": "2024-07-29T15:51:28.071Z",
    "updatedAt": "2024-07-29T15:51:28.071Z"
  }
}
```
