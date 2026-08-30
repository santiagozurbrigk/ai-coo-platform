---
title: "Update invoice late fees configuration"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/update-invoice-late-fees-configuration"
seccion: "Invoice > Invoice > Update invoice late fees configuration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/invoices/:invoiceId/late-fees-configuration"
---

# Update invoice late fees configuration

```http
PATCH /invoices/:invoiceId/late-fees-configuration
```

API to update invoice late fees configuration by invoice id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **invoiceId** `string` _required_ — Invoice Id

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **lateFeesConfiguration** `object` _required_ — late fees configuration

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "lateFeesConfiguration": {
    "enable": true,
    "value": 10,
    "type": "fixed",
    "frequency": {
      "intervalCount": 10,
      "interval": "day"
    },
    "grace": {
      "intervalCount": 10,
      "interval": "day"
    },
    "maxLateFees": {
      "type": "fixed",
      "value": "10"
    }
  }
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — Invoice Id
- **status** `string` _required_ — Invoice Status
  - Available options: `draft`, `sent`, `payment_processing`, `paid`, `void`, `partially_paid`
- **liveMode** `boolean` _required_ — Live Mode
- **amountPaid** `number` _required_ — Amount Paid
- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **name** `string` _required_ — Name of the invoice
- **businessDetails** `object` _required_ — Business Details
- **invoiceNumber** `number` _required_ — Invoice Number
- **currency** `string` _required_ — Currency
- **contactDetails** `object` _required_ — Contact Details
- **issueDate** `string` _required_ — Issue date in YYYY-MM-DD format
- **dueDate** `string` _required_ — Due date in YYYY-MM-DD format
- **discount** `object` — Discount
- **invoiceItems** `string[]` _required_ — Invoice Items
- **total** `number` _required_ — Total Amount
- **title** `string` _required_ — Title
- **amountDue** `number` _required_ — Total Amount Due
- **createdAt** `string` _required_ — created at
- **updatedAt** `string` _required_ — updated at
- **automaticTaxesEnabled** `boolean` — Automatic taxes enabled for the Invoice
- **automaticTaxesCalculated** `boolean` — Is Automatic taxes calculated for the Invoice items
- **paymentSchedule** `object` — split invoice into payment schedule summing up to full invoice amount

```json
{
  "_id": "6578278e879ad2646715ba9c",
  "status": "draft",
  "liveMode": false,
  "amountPaid": 0,
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "name": "New Invoice",
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
  "invoiceNumber": "19",
  "currency": "USD",
  "contactDetails": {
    "id": "c6tZZU0rJBf30ZXx9Gli",
    "phoneNo": "+1-214-559-6993",
    "email": "[email protected]",
    "customFields": [],
    "name": "Alex",
    "address": {
      "countryCode": "US"
    }
  },
  "issueDate": "2023-01-01",
  "dueDate": "2023-01-01",
  "discount": {
    "type": "percentage",
    "value": 0
  },
  "invoiceItems": [
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
  "total": 999,
  "title": "INVOICE",
  "amountDue": 999,
  "createdAt": "2023-12-12T09:27:42.355Z",
  "updatedAt": "2023-12-12T09:27:42.355Z",
  "automaticTaxesEnabled": true,
  "automaticTaxesCalculated": true,
  "paymentSchedule": {}
}
```
