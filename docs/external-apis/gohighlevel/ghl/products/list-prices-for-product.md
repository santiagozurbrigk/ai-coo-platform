---
title: "List Prices for a Product"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/list-prices-for-product"
seccion: "Products > Prices > List Prices for a Product"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/products/:productId/price"
---

# List Prices for a Product

```http
GET /products/:productId/price
```

The "List Prices for a Product" API allows retrieving a paginated list of prices associated with a specific product. Customize your results by filtering prices or paginate through the list using the provided query parameters.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **productId** `string` _required_ — ID of the product that needs to be used

### Query parameters

- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `0`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

- **locationId** `string` _required_ — The unique identifier for the location.
- **ids** `string` — To filter the response only with the given price ids, Please provide with comma separated

### Response (200 · application/json)

Successful response

**Schema**

- **prices** `object[]` _required_ — An array of prices
- **total** `number` _required_

  **Default value:**

  `Total number of prices available`

```json
{
  "prices": [
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
  ],
  "total": 10
}
```
