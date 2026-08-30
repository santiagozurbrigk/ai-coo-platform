---
title: "Add an inbound message"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message"
seccion: "Conversations > Messages > Add an inbound message"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversations/messages/inbound"
---

# Add an inbound message

```http
POST /conversations/messages/inbound
```

Post the necessary fields for the API to add a new inbound message. 

**Note:** Either `conversationId` or `contactId` is required

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **type** `string` _required_ — Message Type
  - Available options: `SMS`, `Email`, `WhatsApp`, `GMB`, `IG`, `FB`, `Custom`, `WebChat`, `Live_Chat`, `Call`
- **attachments** `string[]` — Array of attachments
- **message** `string` — Message Body
- **conversationId** `string` — Conversation Id
- **contactId** `string` — Contact Id
- **conversationProviderId** `string` _required_ — Conversation Provider Id
- **html** `string` — HTML Body of Email
- **subject** `string` — Subject of the Email
- **emailFrom** `string` — Email address to send from. This field is associated with the contact record and cannot be dynamically changed.
- **emailTo** `string` — Recipient email address. This field is associated with the contact record and cannot be dynamically changed.
- **emailCc** `string[]` — List of email address to CC
- **emailBcc** `string[]` — List of email address to BCC
- **emailMessageId** `string` — Send the email message id for which this email should be threaded. This is for replying to a specific email
- **altId** `string` — external mail provider's message id
- **direction** `object` — Message direction, if required can be set manually, default is outbound

  **Default value:**

  `outbound`

- **date** `string<date-time>` — Date of the inbound message
- **call** `object` — Phone call dialer and receiver information

```json
{
  "type": "SMS",
  "attachments": [
    "string"
  ],
  "message": "string",
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "contactId": "ve9EPM428h8vShlRW1KT",
  "conversationProviderId": "61d6d1f9cdac7612faf80753",
  "html": "string",
  "subject": "string",
  "emailFrom": "[email protected]",
  "emailTo": "string",
  "emailCc": [
    "[email protected]",
    "[email protected]"
  ],
  "emailBcc": [
    "[email protected]",
    "[email protected]"
  ],
  "emailMessageId": "string",
  "altId": "61d6d1f9cdac7612faf80753",
  "direction": [
    "outbound",
    "inbound"
  ],
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
