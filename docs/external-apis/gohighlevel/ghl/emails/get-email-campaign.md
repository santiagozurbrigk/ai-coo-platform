---
title: "Get Email Campaign by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/get-email-campaign"
seccion: "Email > Campaigns > Get Email Campaign by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/campaigns/emails/:campaignId"
---

# Get Email Campaign by ID

```http
GET /emails/locations/:locationId/campaigns/emails/:campaignId
```

Get a single email campaign by its ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **campaignId** `string` _required_ — Campaign ID

### Response (200 · application/json)

Success

**Schema**

- **id** `string` _required_ — Campaign ID
- **source** `string` — Source of the campaign
- **sourceId** `string` — Source ID of the campaign
- **name** `string` — Campaign name
- **status** `string` — Campaign status
  - Available options: `all`, `sent`, `failed`, `archived`, `draft`, `processing`, `scheduled`, `cancelled`, `paused`
- **campaignType** `string` — Campaign delivery type
- **campaignCategory** `string` — Campaign category
- **variations** `object[]` — AB test variation identifiers (available only for AB test campaigns)
- **editorType** `string` — Original editor type the campaign was created with
  - Available options: `html`, `builder`, `text`
- **isPlainText** `boolean` — Whether the campaign uses plain text
- **editorContentUrl** `string` — URL to fetch the rendered campaign content as HTML. Issue a GET against this URL to retrieve the body.
- **fromName** `string` — Sender name
- **fromEmail** `string` — Sender email address
- **subject** `string` — Email subject line
- **replyToAddress** `string` — Reply-to email address
- **previewText** `string` — Preview text
- **deleted** `boolean` _required_ — Whether the campaign is deleted
- **createdAt** `string` _required_ — Created at timestamp
- **updatedAt** `string` _required_ — Last updated timestamp
- **traceId** `string` — Trace ID of the request

```json
{
  "id": "67f15c2ae99226d5bcccb8f3",
  "source": "email-campaign",
  "sourceId": "bulkRequest_abc123",
  "name": "February Newsletter",
  "status": "sent",
  "campaignType": "bulk-email",
  "campaignCategory": "normal",
  "variations": [
    {
      "sourceId": "9MhVcU7dTdLI7XOU1Vdt",
      "isWinner": true
    }
  ],
  "editorType": "html",
  "isPlainText": false,
  "editorContentUrl": "https://storage.googleapis.com/email-templates/abc123.html",
  "fromName": "John Doe",
  "fromEmail": "[email protected]",
  "subject": "Welcome to our newsletter",
  "replyToAddress": "[email protected]",
  "previewText": "Check out our latest updates",
  "deleted": false,
  "createdAt": "2025-07-24T11:55:43.598Z",
  "updatedAt": "2026-02-09T04:49:12.322Z",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
