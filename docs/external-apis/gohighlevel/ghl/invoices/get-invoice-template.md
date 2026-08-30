---
title: "Get an template"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/get-invoice-template"
seccion: "Invoice > Template > Get an template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/invoices/template/:templateId"
---

# Get an template

```http
GET /invoices/template/:templateId
```

API to get an template by template id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **templateId** `string` _required_ — Template Id

### Query parameters

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — Template Id
- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **name** `string` _required_ — Name of the Template
- **businessDetails** `object` _required_ — Business Details
- **currency** `string` _required_ — Currency
- **discount** `object` — Discount
- **items** `string[]` _required_ — Invoice Items
- **invoiceNumberPrefix** `string` — prefix for invoice number
- **total** `number` _required_ — Total Amount
- **createdAt** `string` _required_ — created at
- **updatedAt** `string` _required_ — updated at

```json
{
  "_id": "6578278e879ad2646715ba9c",
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "name": "New Template",
  "businessDetails": {
    "name": "Alex",
    "address": {
      "addressLine1": "9931 Beechwood",
      "city": "St. Houston",
      "state": "TX",
      "countryCode": "USA",
      "postalCode": "559-6993"
    },
    "phoneNo": "+1-214-559-6993",
    "website": "www.example.com"
  },
  "currency": "USD",
  "discount": {
    "type": "percentage",
    "value": 0
  },
  "items": [
    {
      "taxes": [],
      "_id": "c6tZZU0rJBf30ZXx9Gli",
      "productId": "c6tZZU0rJBf30ZXx9Gli",
      "priceId": "c6tZZU0rJBf30ZXx9Gli",
      "currency": "USD",
      "name": "Macbook Pro",
      "qty": 1,
      "amount": 999
    }
  ],
  "invoiceNumberPrefix": "INV-",
  "total": 999,
  "createdAt": "2023-12-12T09:27:42.355Z",
  "updatedAt": "2023-12-12T09:27:42.355Z"
}
```
