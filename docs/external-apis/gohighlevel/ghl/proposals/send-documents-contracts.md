---
title: "Send document"
source: "https://marketplace.gohighlevel.com/docs/ghl/proposals/send-documents-contracts"
seccion: "Proposals > Documents > Send document"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/proposals/document/send"
---

# Send document

```http
POST /proposals/document/send
```

Send document to a client

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location Id
- **documentId** `string` _required_ — Document Id
- **documentName** `string` — Document Name
- **medium** `string` — Medium to be used for sending the document
  - Available options: `link`, `email`
- **ccRecipients** `object[]` — CC Recipient
- **notificationSettings** `object`
- **sentBy** `string` _required_ — Sent ByUser Id

```json
{
  "locationId": "hTlkh7t8gujsahgg93",
  "documentId": "hTlkh7t8gujsahgg93",
  "documentName": "new Document",
  "medium": "email",
  "ccRecipients": [
    {
      "id": "u240JcS0E5qE0ziHnwMm",
      "email": "[email protected]",
      "imageUrl": "",
      "contactName": "Jim Anton",
      "firstName": "Jim",
      "lastName": "Anton"
    }
  ],
  "notificationSettings": {
    "sender": {
      "fromName": "",
      "fromEmail": ""
    },
    "receive": {
      "subject": "",
      "templateId": ""
    }
  },
  "sentBy": "1234567890"
}
```

### Response (200 · application/json)

Document sent successfully

**Schema**

- **success** `boolean` _required_ — Success status
- **links** `object[]` _required_ — Links for all recipients

```json
{
  "success": true,
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
  ]
}
```
