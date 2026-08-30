---
title: "Get email by Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/get-email-by-id"
seccion: "Conversations > Email > Get email by Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversations/messages/email/:id"
---

# Get email by Id

```http
GET /conversations/messages/email/:id
```

Get email by Id

## Request

### Response (200 · application/json)

Email object for the id given.

**Schema**

- **id** `string` _required_
- **altId** `string` — External Id
- **threadId** `string` _required_ — Message Id or thread Id
- **locationId** `string` _required_
- **contactId** `string` _required_
- **conversationId** `string` _required_
- **dateAdded** `string` _required_
- **subject** `string`
- **body** `string` _required_
- **direction** `string` _required_
  - Available options: `inbound`, `outbound`
- **status** `string`
  - Available options: `pending`, `scheduled`, `sent`, `delivered`, `read`, `undelivered`, `connected`, `failed`, `opened`
- **contentType** `string` _required_
- **attachments** `string[]` — An array of attachment URLs.
- **provider** `string`
- **from** `string` _required_ — Name and Email Id of the sender
- **to** `string[]` _required_ — List of email Ids of the receivers
- **cc** `string[]` — List of email Ids of the people in the cc field
- **bcc** `string[]` — List of email Ids of the people in the bcc field
- **replyToMessageId** `string` — In case of reply, email message Id of the reply to email
- **source** `string` — Email source
  - Available options: `workflow`, `bulk_actions`, `campaign`, `api`, `app`
- **conversationProviderId** `string` — Conversation provider ID
- **error** `string` — Error message for bounced/failed emails

```json
{
  "id": "ve9EPM428h8vShlRW1KT",
  "altId": "ve9EPM428h8vShlRW1KT",
  "threadId": "ve9EPM428h8vShlRW1KT",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "contactId": "ve9EPM428h8vShlRW1KT",
  "conversationId": "ve9EPM428h8vShlRW1KT",
  "dateAdded": "2024-03-27T18:13:49.000Z",
  "subject": "Order confirm",
  "body": "Hi there",
  "direction": "inbound",
  "status": "pending",
  "contentType": "text/plain",
  "attachments": [
    "string"
  ],
  "provider": "Leadconnector Gmail",
  "from": "string",
  "to": [
    "string"
  ],
  "cc": [
    "string"
  ],
  "bcc": [
    "string"
  ],
  "replyToMessageId": "string",
  "source": "workflow",
  "conversationProviderId": "cI08i1Bls3iTB9bKgF01",
  "error": "string"
}
```
