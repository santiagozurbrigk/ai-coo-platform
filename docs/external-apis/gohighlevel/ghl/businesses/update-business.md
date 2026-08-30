---
title: "Update Business"
source: "https://marketplace.gohighlevel.com/docs/ghl/businesses/update-business"
seccion: "Business > Businesses > Update Business"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/businesses/:businessId"
---

# Update Business

```http
PUT /businesses/:businessId
```

Update Business

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **businessId** `string` _required_

### Request body (application/json)

**Body required**

- **name** `string`
- **phone** `string`
- **email** `string`
- **postalCode** `string`
- **website** `string`
- **address** `string`
- **state** `string`
- **city** `string`
- **country** `string`
- **description** `string`

```json
{
  "name": "Microsoft",
  "phone": "+18832327657",
  "email": "[email protected]",
  "postalCode": "12312312",
  "website": "www.xyz.com",
  "address": "street adress",
  "state": "new york",
  "city": "new york",
  "country": "us",
  "description": "business description"
}
```

### Response (200 · application/json)

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
