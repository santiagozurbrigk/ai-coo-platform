---
title: "List Inventory"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/get-list-inventory"
seccion: "Products > Prices > List Inventory"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/inventory"
---

# List Inventory

```http
GET /products/inventory
```

The "List Inventory API allows the user to retrieve a paginated list of inventory items. Use this endpoint to fetch details for multiple items in the inventory based on the provided query parameters.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `0`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **search** `string` — Search string for Variant Search

### Response (200 · application/json)

Successful response

**Schema**

- **inventory** `object[]` _required_ — List of inventory items
- **total** `object` _required_ — Total count of inventory items

```json
{
  "inventory": [
    {
      "_id": "6241712be68f7a98102ba272",
      "name": "Medium T-shirt",
      "availableQuantity": 50,
      "sku": "TSHIRT-MED-001",
      "allowOutOfStockPurchases": false,
      "product": "6241712be68f7a98102ba270",
      "updatedAt": "2023-12-12T09:27:42.355Z",
      "image": "https://example.com/images/product.jpg",
      "productName": "T-shirt"
    }
  ],
  "total": {
    "total": 100
  }
}
```
