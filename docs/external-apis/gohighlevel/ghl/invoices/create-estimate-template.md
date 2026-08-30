---
title: "Create Estimate Template"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/create-estimate-template"
seccion: "Invoice > Estimate > Create Estimate Template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/invoices/estimate/template"
---

# Create Estimate Template

```http
POST /invoices/estimate/template
```

Create a new estimate template

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **name** `string` _required_ — Estimate Name
- **businessDetails** `object` _required_
- **currency** `string` _required_ — Currency code
- **items** `array[]` _required_ — An array of items for the estimate.
- **liveMode** `boolean` — livemode for estimate

  **Default value:**

  `true`

- **discount** `object` _required_
- **termsNotes** `string` — Terms notes, Also supports HTML markups
- **title** `string` — Title for the estimate
- **automaticTaxesEnabled** `boolean` — Automatic taxes enabled for the Estimate

  **Default value:**

  `false`

- **meta** `object` — Meta data for the estimate
- **sendEstimateDetails** `object` — When sending estimate directly while saving
- **estimateNumberPrefix** `string` — Prefix for the estimate number

  **Default value:**

  `EST-`

- **attachments** `object[]` — attachments for the invoice
- **miscellaneousCharges** `object` — miscellaneous charges for the estimate

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "name": "Home Service Estimate Template",
  "businessDetails": {
    "logoUrl": "https://example.com/logo.png",
    "name": "ABC Corp.",
    "phoneNo": "+1-214-559-6993",
    "address": "9931 Beechwood, TX",
    "website": "wwww.example.com",
    "customValues": [
      "string"
    ]
  },
  "currency": "USD",
  "items": [
    null
  ],
  "liveMode": true,
  "discount": {
    "value": 10,
    "type": "percentage",
    "validOnProductIds": "[ '6579751d56f60276e5bd4154' ]"
  },
  "termsNotes": "<p>This is a default terms.</p>",
  "title": "ESTIMATE",
  "automaticTaxesEnabled": true,
  "meta": {
    "key": "value"
  },
  "sendEstimateDetails": {
    "altId": "6578278e879ad2646715ba9c",
    "altType": "location",
    "action": "sms_and_email",
    "liveMode": true,
    "userId": "6578278e879ad2646715ba9c",
    "sentFrom": {
      "fromName": "Alex",
      "fromEmail": "[email protected]"
    },
    "estimateName": "Estimate"
  },
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

### Response (201 · application/json)

Successfully created

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
  "termsNotes": "<p>All services are subject to availability.</p>"
}
```
