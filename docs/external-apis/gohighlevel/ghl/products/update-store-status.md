---
title: "Action to include/exclude the product in store"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/update-store-status"
seccion: "Products > Store > Action to include/exclude the product in store"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/store/:storeId"
---

# Action to include/exclude the product in store

```http
POST /products/store/:storeId
```

API to update the status of products in a particular store

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **storeId** `string` _required_ — Products related to the store

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **action** `string` _required_ — Action to include or exclude the product from the store
  - Available options: `include`, `exclude`
- **productIds** `string[]` _required_ — Array of product IDs

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "action": "include",
  "productIds": [
    "productId1",
    "productId2"
  ]
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
