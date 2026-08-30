---
title: "Update Product Reviews"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/update-product-review"
seccion: "Products > Reviews > Update Product Reviews"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/products/reviews/:reviewId"
---

# Update Product Reviews

```http
PUT /products/reviews/:reviewId
```

Update status, reply, etc of a particular review

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **reviewId** `string` _required_ — Review Id

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **productId** `string` _required_ — Product Id
- **status** `string` _required_ — Status of the review
- **reply** `object[]` — Reply of the review
- **rating** `number` — Rating of the product
- **headline** `string` — Headline of the Review
- **detail** `string` — Detailed Review of the product

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "productId": "6578278e879ad2646715ba9c",
  "status": "approved",
  "reply": [
    {
      "headline": "Amazing product with great quality",
      "comment": "This product exceeded my expectations in terms of quality and performance. Highly recommended!",
      "user": {
        "name": "John Doe",
        "email": "[email protected]",
        "phone": "+1-555-555-5555",
        "isCustomer": true
      }
    }
  ],
  "rating": "4.5",
  "headline": "Amazing product with great quality",
  "detail": "The product is for sure a must and recommended buy"
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
