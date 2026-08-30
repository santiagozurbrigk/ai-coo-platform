---
title: "Update Product Collection"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/update-product-collection"
seccion: "Products > Collections > Update Product Collection"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/products/collections/:collectionId"
---

# Update Product Collection

```http
PUT /products/collections/:collectionId
```

Update a specific product collection with Id :collectionId

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **collectionId** `string` _required_ — MongoId of the collection

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — The type of alt. For now it is only LOCATION
  - Available options: `location`
- **name** `string` — Name of the Product Collection
- **slug** `string` — Slug of the Product Collection which helps in navigation
- **image** `string` — The URL of the image that is going to be displayed as the collection Thumbnail
- **seo** `object` — The metadata information which will be displayed in SEO previews

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "LOCATION",
  "name": "Best Sellers",
  "slug": "best-sellers",
  "image": "http://example.com/watermark.png",
  "seo": {
    "title": "Best Sellers",
    "description": "Collections where all the best products are available"
  }
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message

```json
{
  "status": true,
  "message": "Successfully created"
}
```
