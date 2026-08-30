---
title: "Create Price for a Product"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/create-price-for-product"
seccion: "Products > Prices > Create Price for a Product"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/:productId/price"
---

# Create Price for a Product

```http
POST /products/:productId/price
```

The "Create Price for a Product" API allows adding a new price associated with a specific product to the system. Use this endpoint to create a price with the specified details for a particular product. Ensure that the required information is provided in the request payload.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **productId** `string` _required_ — ID of the product that needs to be used

### Request body (application/json)

**Body required**

- **name** `string` _required_ — The name of the price.
- **type** `string` _required_ — The type of the price.
  - Available options: `one_time`, `recurring`
- **currency** `string` _required_ — The currency of the price.
- **amount** `number` _required_ — The amount of the price. ( min: 0 )
- **recurring** `object` — The recurring details of the price (if type is recurring).
- **description** `string` — A brief description of the price.
- **membershipOffers** `object[]` — An array of membership offers associated with the price.
- **trialPeriod** `number` — The trial period duration in days (if applicable).
- **totalCycles** `number` — The total number of billing cycles for the price. ( min: 1 )
- **setupFee** `number` — The setup fee for the price.
- **variantOptionIds** `string[]` — An array of variant option IDs associated with the price.
- **compareAtPrice** `number` — The compare at price for the price.
- **locationId** `string` _required_ — The unique identifier of the location associated with the price.
- **userId** `string` — The unique identifier of the user who created the price.
- **meta** `object` — Additional metadata associated with the price.
- **trackInventory** `boolean` — Need to track inventory stock quantity
- **availableQuantity** `number` — Available inventory stock quantity
- **allowOutOfStockPurchases** `boolean` — Continue selling when out of stock
- **sku** `string` — The unique identifier of the SKU associated with the price
- **shippingOptions** `object` — Shipping options of the Price
- **isDigitalProduct** `boolean` — Is the product a digital product
- **digitalDelivery** `string[]` — Digital delivery options

```json
{
  "name": "Price Name",
  "type": "one_time",
  "currency": "USD",
  "amount": 99.99,
  "recurring": {
    "interval": "day",
    "intervalCount": 1
  },
  "description": "string",
  "membershipOffers": [
    {
      "label": "top_50",
      "value": "50",
      "_id": "655b33aa2209e60b6adb87a7"
    }
  ],
  "trialPeriod": 7,
  "totalCycles": 12,
  "setupFee": 10.99,
  "variantOptionIds": [
    "option_id_1",
    "option_id_2"
  ],
  "compareAtPrice": 19.99,
  "locationId": "6578278e879ad2646715ba9c",
  "userId": "6578278e879ad2646715ba9c",
  "meta": {
    "source": "stripe",
    "sourceId": "123",
    "stripePriceId": "price_123",
    "internalSource": "agency_plan"
  },
  "trackInventory": true,
  "availableQuantity": 5,
  "allowOutOfStockPurchases": true,
  "sku": "sku_123",
  "shippingOptions": {
    "weight": {
      "value": 10,
      "unit": "kg"
    },
    "dimensions": {
      "height": 10,
      "width": 10,
      "length": 10,
      "unit": "cm"
    }
  },
  "isDigitalProduct": true,
  "digitalDelivery": [
    "string"
  ]
}
```

### Response (201 · application/json)

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
