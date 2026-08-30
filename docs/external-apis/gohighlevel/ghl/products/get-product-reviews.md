---
title: "Fetch Product Reviews"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/get-product-reviews"
seccion: "Products > Reviews > Fetch Product Reviews"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/reviews"
---

# Fetch Product Reviews

```http
GET /products/reviews
```

API to fetch the Product Reviews

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `0`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

- **sortField** `string` — The field upon which the sort should be applied
  - Available options: `createdAt`, `rating`
- **sortOrder** `string` — The order of sort which should be applied for the sortField
  - Available options: `asc`, `desc`
- **rating** `number` — Key to filter the ratings
- **startDate** `string` — The start date for filtering reviews
- **endDate** `string` — The end date for filtering reviews
- **productId** `string` — Comma-separated list of product IDs
- **storeId** `string` — Comma-separated list of store IDs

### Response (200 · application/json)

Successful response

**Schema**

- **data** `array[]` _required_ — Array of Collections
- **total** `number` _required_ — The total count of the collections present, which is useful to calculate the pagination

```json
{
  "data": [
    null
  ],
  "total": 0
}
```
