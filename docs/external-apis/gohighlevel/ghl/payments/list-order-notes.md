---
title: "List Order Notes"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/list-order-notes"
seccion: "Payments > Order Notes > List Order Notes"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/orders/:orderId/notes"
---

# List Order Notes

```http
GET /payments/orders/:orderId/notes
```

List all notes of an order

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **orderId** `string` _required_ — ID of the order that needs to be returned

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200)

Successful response
