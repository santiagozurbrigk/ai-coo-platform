---
title: "Create Product Collection"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/create-product-collection"
seccion: "Products > Collections > Create Product Collection"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/collections"
---

# Create Product Collection

```http
POST /products/collections
```

Create a new Product Collection for a specific location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — The type of alt. For now it is only LOCATION
  - Available options: `location`
- **collectionId** `string` — Unique Identifier of the Product Collection, Mongo Id
- **name** `string` _required_ — Name of the Product Collection
- **slug** `string` _required_ — Slug of the Product Collection which helps in navigation
- **image** `string` — The URL of the image that is going to be displayed as the collection Thumbnail
- **seo** `object` — The metadata information which will be displayed in SEO previews

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "LOCATION",
  "collectionId": "66057f9d28536eae584ec047",
  "name": "Best Sellers",
  "slug": "best-sellers",
  "image": "http://example.com/watermark.png",
  "seo": {
    "title": "Best Sellers",
    "description": "Collections where all the best products are available"
  }
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **data** `object` _required_ — created Collection

```json
{
  "data": {
    "_id": "655b33a82209e60b6adb87a5",
    "altId": "Z4Bxl8J4SaPEPLq9IQ8g",
    "name": "Best Sellers",
    "slug": "best-sellers",
    "image": "http://example.com/watermark.png",
    "seo": {
      "title": "Best Sellers",
      "description": "Collections where all the best products are available"
    },
    "createdAt": "2024-02-22T09:27:19.728Z"
  }
}
```
