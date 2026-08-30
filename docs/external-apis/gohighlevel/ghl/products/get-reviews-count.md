---
title: "Fetch Review Count as per status"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/get-reviews-count"
seccion: "Products > Reviews > Fetch Review Count as per status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/reviews/count"
---

# Fetch Review Count as per status

```http
GET /products/reviews/count
```

API to fetch the Review Count as per status

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **rating** `number` — Key to filter the ratings
- **startDate** `string` — The start date for filtering reviews
- **endDate** `string` — The end date for filtering reviews
- **productId** `string` — Comma-separated list of product IDs
- **storeId** `string` — Comma-separated list of store IDs

### Response (200 · application/json)

Successful response

**Schema**

- **data** `array[]` _required_ — Array of review status counts

```json
{
  "data": [
    null
  ]
}
```
