---
title: "Update Product Reviews"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/bulk-update-product-review"
seccion: "Products > Reviews > Update Product Reviews"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/reviews/bulk-update"
---

# Update Product Reviews

```http
POST /products/reviews/bulk-update
```

Update one or multiple product reviews: status, reply, etc.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **reviews** `object[]` _required_ — Array of Product Reviews
- **status** `object` _required_ — Status of the review

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "reviews": [
    {
      "reviewId": "6578278e879ad2646715ba9c",
      "productId": "6578278e879ad2646715ba9d",
      "storeId": "a1b2c3d4e5f6g7h8i9j0k1l2"
    }
  ],
  "status": "approved"
}
```

### Response (201 · application/json)

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
