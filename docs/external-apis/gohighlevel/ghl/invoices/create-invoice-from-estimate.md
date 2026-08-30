---
title: "Create Invoice from Estimate"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/create-invoice-from-estimate"
seccion: "Invoice > Estimate > Create Invoice from Estimate"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/invoices/estimate/:estimateId/invoice"
---

# Create Invoice from Estimate

```http
POST /invoices/estimate/:estimateId/invoice
```

Create a new invoice from an existing estimate

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **estimateId** `string` _required_ — Estimate Id

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **markAsInvoiced** `boolean` _required_ — Mark Estimate as Invoiced
- **version** `string` — Version of the update request
  - Available options: `v1`, `v2`

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "markAsInvoiced": true,
  "version": "v2"
}
```

### Response (200 · application/json)

Successfully Created

**Schema**

- **estimate** `object` _required_ — Estimate details
- **invoice** `object` _required_ — Invoice details

```json
{
  "estimate": {
    "altId": "6578278e879ad2646715ba9c",
    "altType": "location",
    "_id": "67ac9a51106ee8311e911XXXX",
    "liveMode": true,
    "deleted": false,
    "name": "Estimate Name",
    "currency": "USD",
    "businessDetails": {
      "logoUrl": "your_image-url",
      "name": "Business name",
      "address": {
        "addressLine1": "address line 1",
        "city": "Test City",
        "state": "State Name",
        "countryCode": "US",
        "postalCode": "12345"
      },
      "phoneNo": "+1 1234567890",
      "website": "www.example.com",
      "customValues": [
        {
          "name": "Test",
          "fieldKey": "{{custom_values.test}}",
          "id": "5DYTWoiQvWiIJZXX44XXX",
          "value": "Test's Custom Value"
        }
      ]
    },
    "items": [
      {
        "taxes": [],
        "taxInclusive": false,
        "_id": "67ac9a51106ee8311e911XXXX",
        "description": "<p>Futuristic anti-gravity racing</p>",
        "currency": "USD",
        "productId": "67ac9a51106ee8311e911XXXX",
        "priceId": "67ac9a51106ee8311e911XXXX",
        "amount": 9.99,
        "qty": 1,
        "name": "TEST",
        "type": "one_time"
      },
      {
        "taxes": [
          {
            "_id": "67ac9a51106ee8311e911XXXX",
            "name": "TaxTwo",
            "rate": 8.5,
            "calculation": "exclusive"
          }
        ],
        "taxInclusive": true,
        "_id": "67ac9a51106ee8311e911XXXX",
        "productId": "67ac9a51106ee8311e911XXXX",
        "priceId": "67ac9a51106ee8311e911XXXX",
        "currency": "USD",
        "name": "TEST2",
        "qty": 1,
        "amount": 500,
        "description": "",
        "type": "recurring"
      }
    ],
    "discount": {
      "type": "percentage",
      "value": 0
    },
    "title": "ESTIMATE",
    "estimateNumberPrefix": "EST-",
    "attachments": [
      {
        "id": "6241712be68f7a98102ba272",
        "name": "Electronics.pdf",
        "url": "https://example.com/digital-delivery",
        "type": "string",
        "size": 10000
      }
    ],
    "updatedBy": "3HIpOF9NIc5ltriQXXXX",
    "total": 1222.03,
    "createdAt": "2025-02-12T13:17:47.416Z",
    "updatedAt": "2025-02-12T13:17:47.416Z",
    "__v": 0,
    "automaticTaxesEnabled": false,
    "termsNotes": "<p>All services are subject to availability.</p>",
    "companyId": "COMP12345",
    "contactDetails": {
      "id": "jvzfKTNdE7OYXXXXXX",
      "name": "Contact Name",
      "phoneNo": "+911111111114",
      "email": "[email protected]",
      "address": {
        "countryCode": "US"
      }
    },
    "issueDate": "2023-06-15T00:00:00.000Z",
    "expiryDate": "2023-07-15T00:00:00.000Z",
    "sentBy": "[email protected]",
    "automaticTaxesCalculated": true,
    "meta": {
      "key": "value"
    },
    "estimateActionHistory": [
      {
        "action": "Created",
        "timestamp": "2023-06-15T10:00:00.000Z"
      }
    ],
    "sentTo": {
      "email": [
        "[email protected]"
      ],
      "phoneNo": [
        "+1 99444444444"
      ]
    },
    "frequencySettings": {
      "enabled": false
    },
    "lastVisitedAt": "2023-06-20T08:30:00.000Z",
    "totalamountInUSD": 1500.75,
    "autoInvoice": {
      "enabled": true,
      "directPayments": false
    },
    "traceId": "010c7a01-857f-4619-970d-xyxyxyxy"
  },
  "invoice": {
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
}
```
