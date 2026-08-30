---
title: "Delete Price by ID for a Product"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/delete-price-by-id-for-product"
seccion: "Products > Prices > Delete Price by ID for a Product"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/products/:productId/price/:priceId"
---

# Delete Price by ID for a Product

```http
DELETE /products/:productId/price/:priceId
```

The "Delete Price by ID for a Product" API allows deleting a specific price associated with a particular product using its unique identifier. Use this endpoint to remove a price from the system.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **productId** `string` _required_ — ID of the product that needs to be used
- **priceId** `string` _required_ — ID of the price that needs to be returned

### Query parameters

- **locationId** `string` _required_ — location Id

### Response (200 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — returns true if the price is successfully deleted

```json
{
  "status": true
}
```
