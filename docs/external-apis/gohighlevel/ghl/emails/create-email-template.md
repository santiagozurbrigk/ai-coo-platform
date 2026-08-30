---
title: "Create an email template"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/create-email-template"
seccion: "Email > Templates > Create an email template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/emails/locations/:locationId/templates"
---

# Create an email template

```http
POST /emails/locations/:locationId/templates
```

Create a new email template

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Template name
- **editorType** `string` _required_ — Editor type for the new template. Use `html` for code-editor templates or `text` for plain-text templates.
  - Available options: `html`, `text`
- **editorContent** `string` — Optional initial editor content. Provide HTML or plain-text string content.
- **parentFolderId** `string` — Parent folder ID
- **subjectLine** `string` — Email subject line
- **fromName** `string` — Sender name
- **fromEmail** `string` — Sender email address
- **previewText** `string` — Preview text
- **userId** `string` — ID of the user performing this action

```json
{
  "name": "Newsletter Template",
  "editorType": "html",
  "editorContent": "<html><body>Hello World</body></html>",
  "parentFolderId": "67f15c2ae99226d5bcccb8f0",
  "subjectLine": "Welcome to our newsletter",
  "fromName": "John Doe",
  "fromEmail": "[email protected]",
  "previewText": "Email preview text",
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
