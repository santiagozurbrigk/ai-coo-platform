---
title: "Import an email template"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/import-email-template"
seccion: "Email > Templates > Import an email template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/emails/locations/:locationId/templates/import"
---

# Import an email template

```http
POST /emails/locations/:locationId/templates/import
```

Import a template from a provider URL

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID

### Request body (application/json)

**Body required**

- **importProvider** `string` _required_ — Import provider (URL-based providers only)
  - Available options: `mailchimp`, `active_campaign`
- **importUrl** `string` _required_ — Public import URL
- **name** `string` — Template name
- **parentFolderId** `string` — Parent folder ID
- **userId** `string` — ID of the user performing this action

```json
{
  "importProvider": "mailchimp",
  "importUrl": "https://templates.example.com/public/template-123",
  "name": "Imported Template",
  "parentFolderId": "67f15c2ae99226d5bcccb8f0",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Response (201 · application/json)

Success

**Schema**

- **id** `string` _required_ — Template ID
- **name** `string` _required_ — Template name
- **editorType** `string` _required_ — Editor type
  - Available options: `html`, `text`
- **isPlainText** `boolean` _required_ — Whether template is plain text
- **parentFolderId** `string` — Parent folder ID
- **fromName** `string` — Sender name
- **fromEmail** `string` — Sender email address
- **subjectLine** `string` — Email subject line
- **previewText** `string` — Preview text
- **previewUrl** `string` — Preview URL
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
  "subjectLine": "Welcome to our newsletter",
  "previewText": "Email preview text",
  "previewUrl": "https://example.com/preview/template123",
  "createdAt": "2025-07-24T11:55:43.598Z",
  "updatedAt": "2025-07-24T11:55:43.598Z",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
