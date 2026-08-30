---
title: "Get Email Template by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/get-email-template"
seccion: "Email > Templates > Get Email Template by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/templates/:templateId"
---

# Get Email Template by ID

```http
GET /emails/locations/:locationId/templates/:templateId
```

Get a single email template by its ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **templateId** `string` _required_ — Template ID

### Response (200 · application/json)

Success

**Schema**

- **id** `string` _required_ — Template ID
- **name** `string` _required_ — Template name
- **editorType** `string` _required_ — Editor type
  - Available options: `html`, `builder`, `text`
- **isPlainText** `boolean` _required_ — Whether template is plain text
- **parentFolderId** `string` — Parent folder ID
- **fromName** `string` — Sender name
- **fromEmail** `string` — Sender email address
- **subject** `string` — Email subject line
- **previewText** `string` — Preview text
- **editorContentUrl** `string` — URL to fetch the rendered template content as HTML. Issue a GET against this URL to retrieve the body.
- **deleted** `boolean` _required_ — Whether the template is deleted
- **createdAt** `string` — Created timestamp
- **updatedAt** `string` — Updated timestamp
- **traceId** `string` — Trace ID of request

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Newsletter Template",
  "editorType": "html",
  "isPlainText": false,
  "parentFolderId": "67f15c2ae99226d5bcccb8f0",
  "fromName": "John Doe",
  "fromEmail": "[email protected]",
  "subject": "Welcome to our newsletter",
  "previewText": "Email preview text",
  "editorContentUrl": "https://storage.googleapis.com/email-templates/abc123.html",
  "deleted": false,
  "createdAt": "2025-07-24T11:55:43.598Z",
  "updatedAt": "2025-07-24T11:55:43.598Z",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
