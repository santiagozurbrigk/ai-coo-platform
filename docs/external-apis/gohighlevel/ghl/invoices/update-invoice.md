---
title: "Update invoice"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/update-invoice"
seccion: "Invoice > Invoice > Update invoice"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/invoices/:invoiceId"
---

# Update invoice

```http
PUT /invoices/:invoiceId
```

API to update invoice by invoice id

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
- **name** `string` _required_ — Name to be updated
- **title** `string` — Title for the invoice
- **currency** `string` _required_ — Currency
- **description** `string` — Description
- **businessDetails** `object` — Business details which need to be updated
- **invoiceNumber** `string` — Invoice Number
- **contactId** `string` — Id of the contact which you need to send the invoice
- **contactDetails** `object`
- **termsNotes** `string` — Terms notes, Also supports HTML markups
- **discount** `object`
- **invoiceItems** `object[]` _required_
- **automaticTaxesEnabled** `boolean` — Automatic taxes enabled for the Invoice
- **liveMode** `boolean` — Payment mode
- **issueDate** `string` _required_ — Issue date in YYYY-MM-DD format
- **dueDate** `string` _required_ — Due date in YYYY-MM-DD format
- **paymentSchedule** `object` — split invoice into payment schedule summing up to full invoice amount
- **tipsConfiguration** `object` — tips configuration for the invoice
- **xeroDetails** `object`
- **invoiceNumberPrefix** `string` — prefix for invoice number
- **paymentMethods** `object` — Payment Methods for Invoices
- **attachments** `object[]` — attachments for the invoice
- **miscellaneousCharges** `object` — miscellaneous charges for the invoice

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "name": "New Invoice",
  "title": "INVOICE",
  "currency": "USD",
  "description": "ABC Corp payments",
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
  "invoiceNumber": "1001",
  "contactId": "6578278e879ad2646715ba9c",
  "contactDetails": {
    "id": "6578278e879ad2646715ba9c",
    "name": "Alex",
    "phoneNo": "+1234567890",
    "email": "[email protected]",
    "additionalEmails": [
      {
        "email": "[email protected]"
      }
    ],
    "companyName": "ABC Corp.",
    "address": {
      "addressLine1": "9931 Beechwood",
      "addressLine2": "Beechwood",
      "city": "St. Houston",
      "state": "TX",
      "countryCode": "US",
      "postalCode": "559-6993"
    },
    "customFields": [
      "string"
    ]
  },
  "termsNotes": "<p>This is a default terms.</p>",
  "discount": {
    "value": 10,
    "type": "percentage",
    "validOnProductIds": "[ '6579751d56f60276e5bd4154' ]"
  },
  "invoiceItems": [
    {
      "name": "ABC Product",
      "description": "ABC Corp.",
      "productId": "6578278e879ad2646715ba9c",
      "priceId": "6578278e879ad2646715ba9c",
      "currency": "USD",
      "amount": 999,
      "qty": 1,
      "taxes": [
        {
          "_id": "string",
          "name": "string",
          "rate": 0,
          "calculation": "exclusive",
          "description": "string",
          "taxId": "string"
        }
      ],
      "automaticTaxCategoryId": "6578278e879ad2646715ba9c",
      "isSetupFeeItem": true,
      "type": "one_time",
      "taxInclusive": true
    }
  ],
  "automaticTaxesEnabled": true,
  "liveMode": true,
  "issueDate": "2023-01-01",
  "dueDate": "2023-01-14",
  "paymentSchedule": {
    "type": "percentage",
    "schedules": [
      "string"
    ]
  },
  "tipsConfiguration": {
    "tipsPercentage": [
      5,
      10,
      15
    ],
    "tipsEnabled": true
  },
  "xeroDetails": {},
  "invoiceNumberPrefix": "INV-",
  "paymentMethods": {
    "stripe": {
      "enableBankDebitOnly": false
    }
  },
  "attachments": [
    {
      "id": "6241712be68f7a98102ba272",
      "name": "Electronics.pdf",
      "url": "https://example.com/digital-delivery",
      "type": "string",
      "size": 10000
    }
  ],
  "miscellaneousCharges": {
    "charges": [
      null
    ],
    "collectedMiscellaneousCharges": 10,
    "paidCharges": [
      {
        "name": "Processing Fee",
        "charge": 10,
        "amount": 10,
        "_id": "673d01d7d547648a8dab6211"
      }
    ]
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
