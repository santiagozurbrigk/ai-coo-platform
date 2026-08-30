---
title: "Update Email Campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/update-email-campaign"
seccion: "Email > Campaigns > Update Email Campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/emails/locations/:locationId/campaigns/emails/:campaignId"
---

# Update Email Campaign

```http
PATCH /emails/locations/:locationId/campaigns/emails/:campaignId
```

Update an email campaign draft

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **campaignId** `string` _required_ — Campaign ID

### Request body (application/json)

**Body required**

- **name** `string` — Campaign name
- **editorContent** `string` — Editor content to update. Required only when updating campaign content, and must be provided together with editorType. Provide HTML or plain-text string content.
- **editorType** `string` — Editor type for campaign content. Required only when updating campaign content, and must be provided together with editorContent.
  - Available options: `html`, `text`
- **userId** `string` — ID of the user performing this action

```json
{
  "name": "Untitled campaign name",
  "editorContent": "<html><body>Hello World</body></html>",
  "editorType": "html",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Response (200 · application/json)

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
