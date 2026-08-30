---
title: "Update an email template"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/update-email-template"
seccion: "Email > Templates > Update an email template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/emails/locations/:locationId/templates/:templateId"
---

# Update an email template

```http
PATCH /emails/locations/:locationId/templates/:templateId
```

Update email template

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **templateId** `string` _required_ — Template ID

### Request body (application/json)

**Body required**

- **name** `string` — Template name
- **editorContent** `string` — Editor content to update. Required only when updating template content, and must be provided together with editorType. Provide HTML or plain-text string content.
- **editorType** `string` — Type of editor content. Required only when updating template content, and must be provided together with editorContent.
  - Available options: `html`, `text`
- **previewText** `string` — Preview text
- **subjectLine** `string` — Email subject line
- **fromName** `string` — Sender name
- **fromEmail** `string` — Sender email address
- **archived** `boolean` — Whether template is archived
- **parentFolderId** `string` — Parent folder ID. Pass `null` to move template to the root level.
- **userId** `string` — ID of the user performing this action

```json
{
  "name": "Newsletter Template",
  "editorContent": "<html><body>Hello World</body></html>",
  "editorType": "html",
  "previewText": "Email preview text",
  "subjectLine": "Welcome to our newsletter",
  "fromName": "John Doe",
  "fromEmail": "[email protected]",
  "archived": false,
  "parentFolderId": "67f15c2ae99226d5bcccb8f0",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Response (200 · application/json)

Success

**Schema**

- **id** `string` _required_ — Template ID
- **name** `string` _required_ — Template name
- **archived** `boolean` _required_ — Whether template is archived
- **fromName** `string` _required_ — Sender name
- **fromEmail** `string` _required_ — Sender email address
- **subjectLine** `string` _required_ — Email subject line
- **previewText** `string` _required_ — Preview text
- **previewUrl** `string` _required_ — Preview URL
- **editorType** `string` — Template type
  - Available options: `html`, `text`
- **isPlainText** `boolean` — Whether template is plain text
- **parentFolderId** `string` — Parent folder ID
- **updatedAt** `string` — Last updated timestamp
- **createdAt** `string` — Created timestamp
- **traceId** `string` — Trace ID of request

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "My Email Template",
  "archived": false,
  "fromName": "John Doe",
  "fromEmail": "[email protected]",
  "subjectLine": "Welcome to our newsletter",
  "previewText": "Check out our latest updates",
  "previewUrl": "https://example.com/preview/template123",
  "editorType": "html",
  "isPlainText": false,
  "parentFolderId": "67f15c2ae99226d5bcccb8f0",
  "updatedAt": "2025-07-24T11:55:43.598Z",
  "createdAt": "2025-07-24T11:55:43.598Z",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
