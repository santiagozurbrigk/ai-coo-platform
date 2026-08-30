---
title: "Update product display priorities in store"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/update-display-priority"
seccion: "Products > Store > Update product display priorities in store"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/store/:storeId/priority"
---

# Update product display priorities in store

```http
POST /products/store/:storeId/priority
```

API to set the display priority of products in a store

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
- **products** `array[]` _required_ — Array of products with their display priorities

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "products": [
    null
  ]
}
```

### Response (200)

Successfully updated display priorities
