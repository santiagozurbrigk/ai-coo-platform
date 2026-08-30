---
title: "Get Bulk Action Campaign by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/get-bulk-action-campaign"
seccion: "Email > Campaigns > Get Bulk Action Campaign by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/campaigns/bulk-actions/:campaignId"
---

# Get Bulk Action Campaign by ID

```http
GET /emails/locations/:locationId/campaigns/bulk-actions/:campaignId
```

Get a single bulk action campaign by its ID

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
- **status** `string` _required_ — Campaign status
  - Available options: `processing`, `scheduled`, `paused`, `complete`, `cancelled`
- **scheduleType** `string` — Schedule type (NOW, SCHEDULED, or DRIP)
  - Available options: `NOW`, `SCHEDULED`, `DRIP`
- **fromName** `string` — Sender name
- **fromEmail** `string` — Sender email address
- **subject** `string` — Email subject line
- **replyToAddress** `string` — Reply-to email address
- **previewText** `string` — Preview text
- **editorType** `string` — Editor type for this campaign
  - Available options: `html`, `builder`, `text`
- **isPlainText** `boolean` — Whether the campaign uses plain text
- **editorContentUrl** `string` — URL to fetch the rendered campaign content as HTML. Issue a GET against this URL to retrieve the body.
- **deleted** `boolean` _required_ — Whether the campaign is deleted
- **createdAt** `string` _required_ — Created at timestamp
- **updatedAt** `string` _required_ — Last updated timestamp
- **completedAt** `string` — Processing completion timestamp
- **traceId** `string` — Trace ID of the request

```json
{
  "id": "OI72xYec4Mho6VBykTvj",
  "source": "email-marketing",
  "sourceId": "115b9030-907c-474c-90a5-2debd838a024",
  "name": "Test Mail",
  "status": "complete",
  "scheduleType": "SCHEDULED",
  "fromName": "John Doe",
  "fromEmail": "[email protected]",
  "subject": "Welcome to our newsletter",
  "replyToAddress": "[email protected]",
  "previewText": "Check out our latest updates",
  "editorType": "html",
  "isPlainText": false,
  "editorContentUrl": "https://storage.googleapis.com/email-templates/abc123.html",
  "deleted": false,
  "createdAt": "2025-07-24T11:55:43.598Z",
  "updatedAt": "2026-02-09T04:49:12.322Z",
  "completedAt": "2025-07-24T11:55:48.000Z",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
