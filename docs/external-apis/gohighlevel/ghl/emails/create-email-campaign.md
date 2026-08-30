---
title: "Create Email Campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/create-email-campaign"
seccion: "Email > Campaigns > Create Email Campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/emails/locations/:locationId/campaigns/emails"
---

# Create Email Campaign

```http
POST /emails/locations/:locationId/campaigns/emails
```

Create a new email campaign

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Campaign name
- **editorType** `string` _required_ — Editor type for the campaign content. Use `html` for code-editor campaigns or `text` for plain-text campaigns.
  - Available options: `html`, `text`
- **templateId** `string` — Existing template ID to create the campaign from. Omit this field to create a blank campaign.
- **editorContent** `string` — Optional initial editor content to persist immediately after campaign creation. Provide HTML or plain-text string content.
- **parentFolderId** `string` — Parent folder ID
- **timeZone** `string` _required_ — Timezone for the campaign
- **userId** `string` _required_ — ID of the user performing this action
- **userName** `string` — Name of the user performing this action

```json
{
  "name": "Untitled campaign name",
  "editorType": "html",
  "templateId": "507f1f77bcf86cd799439011",
  "editorContent": "<html><body>Hello World</body></html>",
  "parentFolderId": "67f15c2ae99226d5bcccb8f0",
  "timeZone": "Asia/Kolkata",
  "userId": "507f1f77bcf86cd799439099",
  "userName": "John Doe"
}
```

### Response (201 · application/json)

Success

**Schema**

- **id** `string` _required_ — Campaign ID
- **source** `string` — Source of the campaign
- **sourceId** `string` — Source ID of the campaign
- **name** `string` — Campaign name
- **status** `string` — Campaign status
  - Available options: `all`, `sent`, `failed`, `archived`, `draft`, `processing`, `scheduled`, `cancelled`, `paused`
- **campaignType** `string` — Campaign type
- **campaignCategory** `string` — Campaign category
- **variations** `object[]` — AB test variation identifiers (available only for AB test campaigns)
- **deleted** `boolean` _required_ — Whether the campaign is deleted
- **createdAt** `string` _required_ — Created at timestamp
- **updatedAt** `string` _required_ — Last updated timestamp
- **traceId** `string` — Trace ID of request

```json
{
  "id": "67f15c2ae99226d5bcccb8f3",
  "source": "email-campaign",
  "sourceId": "bulkRequest_abc123",
  "name": "February Newsletter",
  "status": "sent",
  "campaignType": "bulk-email",
  "campaignCategory": "email-campaign",
  "variations": [
    {
      "sourceId": "9MhVcU7dTdLI7XOU1Vdt",
      "isWinner": true
    }
  ],
  "deleted": false,
  "createdAt": "2025-07-24T11:55:43.598Z",
  "updatedAt": "2026-02-09T04:49:12.322Z",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
