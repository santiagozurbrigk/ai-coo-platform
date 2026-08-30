---
title: "Bulk Edit Products and Prices"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/bulk-edit"
seccion: "Products > Products > Bulk Edit Products and Prices"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/bulk-update/edit"
---

# Bulk Edit Products and Prices

```http
POST /products/bulk-update/edit
```

API to bulk edit products and their associated prices (max 30 entities)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **products** `object[]` _required_ — Array of products to update. Note: The total count includes all prices within each product.

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "products": [
    {
      "_id": "64a1b2c3d4e5f67890123456",
      "name": "Premium Product",
      "description": "A high-quality premium product with excellent features and durability",
      "image": "https://example.com/product-image.jpg",
      "availableInStore": true,
      "prices": [
        {
          "_id": "64a1b2c3d4e5f67890123456",
          "name": "Standard Plan",
          "amount": 99.99,
          "currency": "USD",
          "compareAtPrice": 129.99,
          "availableQuantity": 100,
          "trackInventory": true,
          "allowOutOfStockPurchases": false,
          "sku": "SKU-001",
          "trialPeriod": 7,
          "totalCycles": 12,
          "setupFee": 25,
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
          "recurring": {
            "interval": "day",
            "intervalCount": 1
          }
        }
      ],
      "collectionIds": [
        "64a1b2c3d4e5f67890123458",
        "64a1b2c3d4e5f67890123459"
      ],
      "isLabelEnabled": true,
      "isTaxesEnabled": true,
      "seo": {
        "title": "Best Product - Buy Now",
        "description": "This is the best product you can buy online with amazing features and great value"
      },
      "slug": "premium-product",
      "automaticTaxCategoryId": "64a1b2c3d4e5f67890123460",
      "taxInclusive": false,
      "taxes": [
        {}
      ],
      "medias": [
        {}
      ],
      "label": {}
    }
  ]
}
```

### Response (201 · application/json)

Products and prices updated successfully

**Schema**

- **message** `string` _required_ — Success message
- **status** `boolean` _required_ — Operation status
- **updatedCount** `number` _required_ — Number of products updated

```json
{
  "message": "Products updated successfully",
  "status": true,
  "updatedCount": 5
}
```
