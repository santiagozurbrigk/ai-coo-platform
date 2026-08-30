---
title: "Send template"
source: "https://marketplace.gohighlevel.com/docs/ghl/proposals/send-documents-contracts-template"
seccion: "Proposals > Templates > Send template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/proposals/templates/send"
---

# Send template

```http
POST /proposals/templates/send
```

Send template to a client

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **templateId** `string` _required_ — Template Id
- **userId** `string` _required_ — User Id
- **sendDocument** `boolean` — Send Document
- **locationId** `string` _required_ — Location Id
- **contactId** `string` _required_ — Contact Id
- **opportunityId** `string` — Opportunity Id

```json
{
  "templateId": "hTlkh7t8gujsahgg93",
  "userId": "hTlkh7t8gujsahgg93",
  "sendDocument": true,
  "locationId": "hTlkh7t8gujsahgg93",
  "contactId": "hTlkh7t8gujsahgg93",
  "opportunityId": "hTlkh7t8gujsahgg93"
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
