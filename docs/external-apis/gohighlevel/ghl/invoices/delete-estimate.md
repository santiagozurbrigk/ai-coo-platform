---
title: "Delete Estimate"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/delete-estimate"
seccion: "Invoice > Estimate > Delete Estimate"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/invoices/estimate/:estimateId"
---

# Delete Estimate

```http
DELETE /invoices/estimate/:estimateId
```

Delete an existing estimate

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

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location"
}
```

### Response (200 · application/json)

Successfully Deleted

**Schema**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **_id** `string` _required_ — Unique identifier
- **liveMode** `boolean` _required_ — Indicates if it is in live mode
- **deleted** `boolean` _required_ — Indicates if deleted
- **name** `string` _required_ — Name
- **currency** `string` _required_ — Currency code
- **businessDetails** `object` _required_ — Business details associated with the estimate
- **items** `array[]` _required_ — An array of items
- **discount** `object` _required_ — Discount details for the estimate template
- **title** `string` — Title
- **estimateNumberPrefix** `string` — Estimate number prefix
- **attachments** `object[]` — Attachments
- **updatedBy** `string` — User Id of who last updated
- **total** `number` _required_ — Total amount
- **createdAt** `string<date-time>` _required_ — Timestamp when created
- **updatedAt** `string<date-time>` _required_ — Timestamp when last updated
- **__v** `number` _required_ — Version number
- **automaticTaxesEnabled** `boolean` _required_ — Indicates if automatic taxes are enabled for this estimate
- **termsNotes** `string` — Terms and conditions for the estimate, supports HTML markup
- **companyId** `string` _required_ — Company identifier associated with the estimate
- **contactDetails** `object` _required_ — Contact details for the estimate
- **issueDate** `string<date-time>` _required_ — Date when the estimate was issued
- **expiryDate** `string<date-time>` _required_ — Date when the estimate expires
- **sentBy** `string` — User who sent the estimate
- **automaticTaxesCalculated** `boolean` _required_ — Indicates if automatic taxes were calculated
- **meta** `object` _required_ — Additional metadata associated with the estimate
- **estimateActionHistory** `string[]` _required_ — History of actions taken on the estimate
- **sentTo** `object` _required_ — Recipient details for the estimate
- **frequencySettings** `object` _required_ — Frequency settings for recurring estimates
- **lastVisitedAt** `string<date-time>` _required_ — Timestamp when the estimate was last visited
- **totalamountInUSD** `number` _required_ — Total amount in USD
- **autoInvoice** `object` — Auto-invoice settings for the estimate
- **traceId** `string` _required_ — Trace ID for logging and debugging

```json
{
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
}
```
