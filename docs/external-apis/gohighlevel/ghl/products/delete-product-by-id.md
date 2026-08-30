---
title: "Delete Product by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/delete-product-by-id"
seccion: "Products > Products > Delete Product by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/products/:productId"
---

# Delete Product by ID

```http
DELETE /products/:productId
```

The "Delete Product by ID" API allows deleting a specific product using its unique identifier. Use this endpoint to remove a product from the system.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **productId** `string` _required_ — ID or the slug of the product that needs to be returned

### Query parameters

- **locationId** `string` _required_ — location Id
- **sendWishlistStatus** `boolean` — Parameter which will decide whether to show the wishlisting status of products

### Response (200 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — returns true if the product is successfully deleted

```json
{
  "status": true
}
```
