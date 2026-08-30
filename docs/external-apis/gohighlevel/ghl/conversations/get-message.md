---
title: "Get message by message id"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/get-message"
seccion: "Conversations > Messages > Get message by message id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversations/messages/:id"
---

# Get message by message id

```http
GET /conversations/messages/:id
```

Get message by message id.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Response (200 · application/json)

Message object for the id given.

**Schema**

- **id** `string` _required_
- **altId** `string` — Alternative identifier for the message
- **type** `number` _required_
- **messageType** `string` _required_ — Type of the message as a string
  - Available options: `TYPE_CALL`, `TYPE_SMS`, `TYPE_EMAIL`, `TYPE_SMS_REVIEW_REQUEST`, `TYPE_WEBCHAT`, `TYPE_SMS_NO_SHOW_REQUEST`, `TYPE_CAMPAIGN_SMS`, `TYPE_CAMPAIGN_CALL`, `TYPE_CAMPAIGN_EMAIL`, `TYPE_CAMPAIGN_VOICEMAIL`, `TYPE_FACEBOOK`, `TYPE_CAMPAIGN_FACEBOOK`
- **locationId** `string` _required_
- **contactId** `string` _required_
- **conversationId** `string` _required_
- **dateAdded** `string` _required_
- **body** `string`
- **direction** `string` _required_
  - Available options: `inbound`, `outbound`
- **status** `string`
  - Available options: `connected`, `delivered`, `failed`, `opened`, `pending`, `read`, `scheduled`, `sent`, `undelivered`, `clicked`, `opt_out`
- **contentType** `string` _required_
- **attachments** `string[]` — An array of attachment URLs. Attachments will be empty for Call and Voicemails, type 1 and 10. Please use get call recording API to fetch call recording and voicemails.
- **meta** `object`
- **source** `string` — Message source
  - Available options: `workflow`, `bulk_actions`, `campaign`, `api`, `app`
- **userId** `string` — User Id
- **conversationProviderId** `string` — Conversation Provider Id
- **chatWidgetId** `string` — Chat Widget Id
- **from** `string` — Sender identifier (phone/name). Not returned for email types.
- **to** `string` — Recipient identifier (phone/name). Not returned for email types.
- **error** `string` — Error message if message delivery failed

```json
{
  "id": "ve9EPM428h8vShlRW1KT",
  "altId": "msg_123456789",
  "type": 1,
  "messageType": "SMS",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "contactId": "ve9EPM428h8vShlRW1KT",
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "dateAdded": "2024-03-27T18:13:49.000Z",
  "body": "Hi there",
  "direction": "inbound",
  "status": "connected",
  "contentType": "text/plain",
  "attachments": [
    "string"
  ],
  "meta": {
    "callDuration": 120,
    "callStatus": "completed",
    "email": {
      "email": {
        "messageIds": [
          "ve9EPM428kjkvShlRW1KT",
          "ve9EPs1028kjkvShlRW1KT"
        ]
      }
    },
    "ig": {
      "ig": {
        "page_id": "1234567890",
        "page_name": "Instagram Page"
      }
    },
    "fb": {
      "fb": {
        "page_id": "1234567890",
        "page_name": "Facebook Page"
      }
    }
  },
  "source": "workflow",
  "userId": "ve9EPM428kjkvShlRW1KT",
  "conversationProviderId": "ve9EPM428kjkvShlRW1KT",
  "chatWidgetId": "67b0cc8cf14b19d85ace7s35",
  "from": "+14155551234",
  "to": "+14155555678",
  "error": "string"
}
```
