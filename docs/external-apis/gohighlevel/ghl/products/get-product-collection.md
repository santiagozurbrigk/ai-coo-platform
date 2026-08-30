---
title: "Fetch Product Collections"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/get-product-collection"
seccion: "Products > Collections > Fetch Product Collections"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/collections"
---

# Fetch Product Collections

```http
GET /products/collections
```

Internal API to fetch the Product Collections

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `10`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — The type of alt. For now it is only LOCATION
  - Available options: `location`
- **collectionIds** `string` — Ids of the collections separated by comma(,) for search purposes
- **name** `string` — Query to search collection based on names

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
