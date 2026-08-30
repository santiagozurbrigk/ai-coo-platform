---
title: "Get Details about individual product collection"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/get-product-collection-id"
seccion: "Products > Collections > Get Details about individual product collection"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/collections/:collectionId"
---

# Get Details about individual product collection

```http
GET /products/collections/:collectionId
```

Get Details about individual product collection

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **collectionId** `string` _required_ — Collection Id

### Query parameters

- **altId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object` _required_ — Collection Data
- **status** `boolean` _required_ — Status of the operation

```json
{
  "data": {},
  "status": true
}
```
