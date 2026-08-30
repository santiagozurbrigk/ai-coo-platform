---
title: "Delete Product Collection"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/delete-product-collection"
seccion: "Products > Collections > Delete Product Collection"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/products/collections/:collectionId"
---

# Delete Product Collection

```http
DELETE /products/collections/:collectionId
```

Delete specific product collection with Id :collectionId

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **collectionId** `string` _required_ — MongoId of the collection

### Query parameters

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — The type of alt. For now it is only LOCATION
  - Available options: `location`

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
