---
title: "Update Inventory"
source: "https://marketplace.gohighlevel.com/docs/ghl/products/update-inventory"
seccion: "Products > Prices > Update Inventory"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/products/inventory"
---

# Update Inventory

```http
POST /products/inventory
```

The Update Inventory API allows the user to bulk update the inventory for multiple items. Use this endpoint to update the available quantity and out-of-stock purchase settings for multiple items in the inventory.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **items** `object[]` _required_ — Array of items to update in the inventory.

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "items": [
    {
      "priceId": "5e9f8f8f8f8f8f8f8f8f8f8",
      "availableQuantity": 10,
      "allowOutOfStockPurchases": false
    }
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
