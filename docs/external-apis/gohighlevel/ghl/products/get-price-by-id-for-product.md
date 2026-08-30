---
title: "Get Price by ID for a Product"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/get-price-by-id-for-product"
seccion: "Products > Prices > Get Price by ID for a Product"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/:productId/price/:priceId"
---

# Get Price by ID for a Product

```http
GET /products/:productId/price/:priceId
```

The "Get Price by ID for a Product" API allows retrieving information for a specific price associated with a particular product using its unique identifier. Use this endpoint to fetch details for a single price based on the provided price ID and product ID.

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

- **_id** `string` _required_ — The unique identifier for the price.
- **membershipOffers** `object[]` — An array of membership offers associated with the price.
- **variantOptionIds** `string[]` — An array of variant option IDs associated with the price.
- **locationId** `string` — The unique identifier for the location.
- **product** `string` — The unique identifier for the associated product.
- **userId** `string` — The unique identifier for the user.
- **name** `string` _required_ — The name of the price.
- **type** `string` _required_ — The type of the price (e.g., one_time).
  - Available options: `one_time`, `recurring`
- **currency** `string` _required_ — The currency code for the price.
- **amount** `number` _required_ — The amount of the price.
- **recurring** `object` — The recurring details of the price (if type is recurring).
- **createdAt** `string<date-time>` — The creation timestamp of the price.
- **updatedAt** `string<date-time>` — The last update timestamp of the price.
- **compareAtPrice** `number` — The compare-at price for comparison purposes.
- **trackInventory** `boolean` — Indicates whether inventory tracking is enabled.
- **availableQuantity** `number` — Available inventory stock quantity
- **allowOutOfStockPurchases** `boolean` — Continue selling when out of stock

```json
{
  "_id": "655b33aa2209e60b6adb87a7",
  "membershipOffers": [
    {
      "label": "top_50",
      "value": "50",
      "_id": "655b33aa2209e60b6adb87a7"
    }
  ],
  "variantOptionIds": [
    "h4z7u0im2q8",
    "h3nst2ltsnn"
  ],
  "locationId": "3SwdhCsvxI8Au3KsPJt6",
  "product": "655b33a82209e60b6adb87a5",
  "userId": "6YAtzfzpmHAdj0e8GkKp",
  "name": "Red / S",
  "type": "one_time",
  "currency": "INR",
  "amount": 199999,
  "recurring": {
    "interval": "day",
    "intervalCount": 1
  },
  "createdAt": "2023-11-20T10:23:38.645Z",
  "updatedAt": "2024-01-23T09:57:04.852Z",
  "compareAtPrice": 2000000,
  "trackInventory": null,
  "availableQuantity": 5,
  "allowOutOfStockPurchases": true
}
```
