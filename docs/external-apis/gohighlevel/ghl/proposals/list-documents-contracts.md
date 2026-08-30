---
title: "List documents"
source: "https://marketplace.gohighlevel.com/docs/ghl/proposals/list-documents-contracts"
seccion: "Proposals > Documents > List documents"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/proposals/document"
---

# List documents

```http
GET /proposals/document
```

List documents for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id
- **status** `string` — Document status, pass as comma separated values
  - Available options: `draft`, `sent`, `viewed`, `completed`, `accepted`
- **paymentStatus** `string` — Payment status, pass as comma separated values
  - Available options: `waiting_for_payment`, `paid`, `no_payment`
- **limit** `number` — Limit to fetch number of records
- **skip** `number` — Skip number of records
- **query** `string` — Search string
- **dateFrom** `string` — Date start from (ISO 8601), dateFrom & DateTo must be provided together
- **dateTo** `string` — Date to (ISO 8601), dateFrom & DateTo must be provided together

### Response (200 · application/json)

Document fetched successfully

**Schema**

- **documents** `object[]` _required_ — List of documents
- **total** `number` _required_ — Total records available
- **whiteLabelBaseUrl** `number` — WhiteLabel url for document
- **whiteLabelBaseUrlForInvoice** `number` — WhiteLabel url for invoice

```json
{
  "documents": [
    {
      "locationId": "hTlkh7t8gujsahgg93",
      "documentId": "hTlkh7t8gujsahgg93",
      "_id": "67ac9a51106ee8311e911XXXX",
      "name": "Document Name",
      "type": "proposal",
      "deleted": false,
      "isExpired": false,
      "documentRevision": 1,
      "fillableFields": [
        {
          "fieldId": "text_field_1",
          "isRequired": true,
          "hasCompleted": true,
          "recipient": "John Doe",
          "entityType": "contacts",
          "id": "2d0a6fe1-d519-4198-8785-3da1d7cab925",
          "type": "TextField",
          "value": "John Doe"
        }
      ],
      "grandTotal": {
        "amount": 100,
        "currency": "USD",
        "discountPercentage": 15,
        "discounts": [
          {
            "id": "123456",
            "value": 10,
            "type": "percentage"
          }
        ]
      },
      "locale": "en-US",
      "status": "draft",
      "paymentStatus": "paid",
      "recipients": [
        {
          "id": "u240JcS0E5qE0ziHnwMm",
          "email": "[email protected]",
          "imageUrl": "",
          "contactName": "Jim Anton",
          "firstName": "Jim",
          "lastName": "Anton",
          "role": "signer",
          "hasCompleted": true,
          "signingOrder": 1,
          "imgUrl": "base64 image url",
          "ip": "123.123.123.123"
        }
      ],
      "links": [
        {
          "referenceId": "550e8400-e29b-41d4-a716-446655440000",
          "documentId": "c1e87a91-93b2-4b78-821f-85cf0e1f925b",
          "recipientId": "u240JcS0E5qE0ziHnwMm",
          "entityName": "contacts",
          "recipientCategory": "recipient",
          "documentRevision": 1,
          "createdBy": "b6d8fa28-1112-4dc7-b9d2-f22b75a477ea",
          "deleted": false
        }
      ],
      "updatedAt": "2025-02-03T18:30:00.000Z",
      "createdAt": "2025-02-14T18:29:59.999Z"
    }
  ],
  "total": 10,
  "whiteLabelBaseUrl": "https://example.com",
  "whiteLabelBaseUrlForInvoice": "https://example.com"
}
```
