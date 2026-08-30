---
title: "Add an external outbound call"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-outbound-message"
seccion: "Conversations > Messages > Add an external outbound call"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversations/messages/outbound"
---

# Add an external outbound call

```http
POST /conversations/messages/outbound
```

Post the necessary fields for the API to add a new outbound call.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **type** `string` _required_ — Message Type
  - Available options: `Call`
- **attachments** `string[]` — Array of attachments
- **conversationId** `string` — Conversation Id. Provide either conversationId or contactId.
- **contactId** `string` — Contact Id. When provided without conversationId, the conversation is resolved or created from this contact.
- **conversationProviderId** `string` _required_ — Conversation Provider Id
- **altId** `string` — external mail provider's message id
- **date** `string<date-time>` — Date of the outbound message
- **call** `object` — Phone call dialer and receiver information

```json
{
  "type": "Call",
  "attachments": [
    "string"
  ],
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "contactId": "ve9EPM428h8vShlRW1KT",
  "conversationProviderId": "61d6d1f9cdac7612faf80753",
  "altId": "61d6d1f9cdac7612faf80753",
  "date": "2024-07-29T15:51:28.071Z",
  "call": {
    "to": "+15037081210",
    "from": "+15037081210",
    "status": "completed"
  }
}
```

### Response (200 · application/json)

Created the message

**Schema**

- **success** `boolean` _required_
- **conversationId** `string` _required_ — Conversation ID.
- **messageId** `string` _required_ — This is the main Message ID
- **message** `string` _required_
- **contactId** `string`
- **dateAdded** `string<date-time>`
- **emailMessageId** `string`

```json
{
  "success": true,
  "conversationId": "ABC12h2F6uBrIkfXYazb",
  "messageId": "t22c6DQcTDf3MjRhwf77",
  "message": "string",
  "contactId": "string",
  "dateAdded": "2024-07-29T15:51:28.071Z",
  "emailMessageId": "string"
}
```
