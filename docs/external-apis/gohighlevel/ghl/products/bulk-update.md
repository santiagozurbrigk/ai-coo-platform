---
title: "Bulk Update Products"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/bulk-update"
seccion: "Products > Products > Bulk Update Products"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/bulk-update"
---

# Bulk Update Products

```http
POST /products/bulk-update
```

API to bulk update products (price, availability, collections, delete)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **type** `string` _required_ — Type of bulk update operation
  - Available options: `bulk-update-price`, `bulk-update-availability`, `bulk-update-product-collection`, `bulk-delete-products`, `bulk-update-currency`
- **productIds** `string[]` _required_ — Array of product IDs
- **filters** `object` — Filters to apply when selectAll is true
- **price** `object` — Price update configuration
- **compareAtPrice** `object` — Compare at price update configuration
- **availability** `boolean` — New availability status
- **collectionIds** `string[]` — Array of collection IDs
- **currency** `string` — Currency code

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "type": "bulk-update-price",
  "productIds": [
    "5f8d0d55b54764421b7156c1"
  ],
  "filters": {
    "collectionIds": [
      "5f8d0d55b54764421b7156c1",
      "5f8d0d55b54764421b7156c2"
    ],
    "productType": "one-time",
    "availableInStore": true,
    "search": "blue t-shirt"
  },
  "price": {
    "type": "INCREASE_BY_AMOUNT",
    "value": 100,
    "roundToWhole": true
  },
  "compareAtPrice": {
    "type": "INCREASE_BY_AMOUNT",
    "value": 100,
    "roundToWhole": true
  },
  "availability": true,
  "collectionIds": [
    "string"
  ],
  "currency": "USD"
}
```

### Response (201 · application/json)

Products updated successfully

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message

```json
{
  "status": true,
  "message": "Successfully created"
}
```
