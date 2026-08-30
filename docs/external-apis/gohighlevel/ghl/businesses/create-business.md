---
title: "Create Business"
source: "https://marketplace.gohighlevel.com/docs/ghl/businesses/create-business"
seccion: "Business > Businesses > Create Business"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/businesses/"
---

# Create Business

```http
POST /businesses/
```

Create Business

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **name** `string` _required_
- **locationId** `string` _required_
- **phone** `string`
- **email** `string`
- **website** `string`
- **address** `string`
- **city** `string`
- **postalCode** `string`
- **state** `string`
- **country** `string`
- **description** `string`

```json
{
  "name": "Microsoft",
  "locationId": "5DP4iH6HLkQsiKESj6rh",
  "phone": "+18832327657",
  "email": "[email protected]",
  "website": "www.xyz.com",
  "address": "street adress",
  "city": "new york",
  "postalCode": "12312312",
  "state": "new york",
  "country": "us",
  "description": "business description"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success Value
- **buiseness** `object` _required_ — Business Response

```json
{
  "success": true,
  "buiseness": {
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
