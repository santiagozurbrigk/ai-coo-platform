---
title: "Fetch Product Store Stats"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/get-product-store-stats"
seccion: "Products > Store > Fetch Product Store Stats"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/store/:storeId/stats"
---

# Fetch Product Store Stats

```http
GET /products/store/:storeId/stats
```

API to fetch the total number of products, included in the store, and excluded from the store and other stats

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **storeId** `string` _required_ — Products related to the store

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **search** `string` — The name of the product for searching.
- **collectionIds** `string` — Filter by product collection Ids. Supports comma separated values

### Response (200 · application/json)

Successful response

**Schema**

- **totalProducts** `number` _required_ — Total number of products
- **includedInStore** `number` _required_ — Number of products included in the store
- **excludedFromStore** `number` _required_ — Number of products excluded from the store

```json
{
  "totalProducts": 100,
  "includedInStore": 80,
  "excludedFromStore": 20
}
```
