---
title: "Cancel an scheduled invoice"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/cancel-invoice-schedule"
seccion: "Invoice > Schedule > Cancel an scheduled invoice"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/invoices/schedule/:scheduleId/cancel"
---

# Cancel an scheduled invoice

```http
POST /invoices/schedule/:scheduleId/cancel
```

API to cancel a scheduled invoice by schedule id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **scheduleId** `string` _required_ — Schedule Id

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — Schedule Id
- **status** `object` _required_ — Schedule Status
- **liveMode** `boolean` _required_ — Live Mode
- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **name** `string` _required_ — Name of the invoice
- **schedule** `object`
- **invoices** `object[]` _required_ — List of invoices
- **businessDetails** `object` _required_ — Business Details
- **currency** `string` _required_ — Currency
- **contactDetails** `object` _required_ — Contact Details
- **discount** `object` — Discount
- **items** `string[]` _required_ — Invoice Items
- **total** `number` _required_ — Total Amount
- **title** `string` _required_ — Title
- **termsNotes** `string` _required_ — Terms notes
- **compiledTermsNotes** `string` _required_ — Compiled terms notes
- **createdAt** `string` _required_ — created at
- **updatedAt** `string` _required_ — updated at

```json
{
  "_id": "6578278e879ad2646715ba9c",
  "status": "draft",
  "liveMode": false,
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "name": "New Invoice",
  "schedule": {
    "executeAt": "string",
    "rrule": {
      "intervalType": "monthly",
      "interval": 2,
      "startDate": "2023-01-01",
      "startTime": "20:45:00",
      "endDate": "2029-11-01",
      "endTime": "18:45:00",
      "dayOfMonth": 15,
      "dayOfWeek": "mo",
      "numOfWeek": -1,
      "monthOfYear": "jan",
      "count": 10,
      "daysBefore": 5,
      "useStartAsPrimaryUserAccepted": true,
      "endType": "by"
    }
  },
  "invoices": [
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
  ],
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
  "total": 999,
  "title": "INVOICE",
  "termsNotes": "Confidential",
  "compiledTermsNotes": "Confidential",
  "createdAt": "2023-12-12T09:27:42.355Z",
  "updatedAt": "2023-12-12T09:27:42.355Z"
}
```
