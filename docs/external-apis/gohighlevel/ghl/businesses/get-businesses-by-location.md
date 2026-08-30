---
title: "Get Businesses by Location"
source: "https://marketplace.gohighlevel.com/docs/ghl/businesses/get-businesses-by-location"
seccion: "Business > Businesses > Get Businesses by Location"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/businesses/"
---

# Get Businesses by Location

```http
GET /businesses/
```

Get Businesses by Location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **limit** `string`

  Default value:

  `100`

- **skip** `string`

  Default value:

  `0`

### Response (200 · application/json)

Successful response

**Schema**

- **businesses** `object[]` _required_ — Business Response

```json
{
  "businesses": [
    {
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
  ]
}
```
