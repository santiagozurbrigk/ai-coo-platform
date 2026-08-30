---
title: "Delete Product Review"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/delete-product-review"
seccion: "Products > Reviews > Delete Product Review"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/products/reviews/:reviewId"
---

# Delete Product Review

```http
DELETE /products/reviews/:reviewId
```

Delete specific product review

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **reviewId** `string` _required_ — Review Id

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **productId** `string` _required_ — Product Id of the product

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
