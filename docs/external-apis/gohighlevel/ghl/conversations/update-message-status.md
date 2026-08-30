---
title: "Update message status"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/update-message-status"
seccion: "Conversations > Messages > Update message status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/conversations/messages/:messageId/status"
---

# Update message status

```http
PUT /conversations/messages/:messageId/status
```

Post the necessary fields for the API to update message status.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **messageId** `string` _required_ — Message Id

### Request body (application/json)

**Body required**

- **status** `string` _required_ — Message status
  - Available options: `delivered`, `failed`, `pending`, `read`
- **error** `object` — Error object from the conversation provider
- **emailMessageId** `string` — Email message Id
- **recipients** `string[]` — Email delivery status for additional email recipients.

```json
{
  "status": "read",
  "error": {
    "code": "1",
    "type": "saas",
    "message": "There was an error from the provider"
  },
  "emailMessageId": "ve9EPM428h8vShlRW1KT",
  "recipients": [
    "string"
  ]
}
```

### Response (200 · application/json)

Created the message

**Schema**

- **conversationId** `string` _required_ — Conversation ID.
- **emailMessageId** `string` — This contains the email message id (only for Email type). Use this ID to send inbound replies to CRM to create a threaded email.
- **messageId** `string` _required_ — This is the main Message ID
- **messageIds** `string[]` — When sending via the GMB channel, we will be returning list of `messageIds` instead of single `messageId`.
- **msg** `string` — Additional response message when sending a workflow message

```json
{
  "conversationId": "ABC12h2F6uBrIkfXYazb",
  "emailMessageId": "rnGyqh2F6uBrIkfhFo9A",
  "messageId": "t22c6DQcTDf3MjRhwf77",
  "messageIds": [
    "string"
  ],
  "msg": "Message queued successfully."
}
```
