---
title: "Update Conversation"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/update-conversation"
seccion: "Conversations > Conversations > Update Conversation"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/conversations/:conversationId"
---

# Update Conversation

```http
PUT /conversations/:conversationId
```

Update the conversation details based on the conversation ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **conversationId** `string` _required_ — Conversation ID as string

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID as string
- **unreadCount** `number` — Count of unread messages in the conversation
- **starred** `boolean` — Starred status of the conversation.
- **feedback** `object`

```json
{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "unreadCount": 1,
  "starred": true,
  "feedback": {}
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Boolean value as the API response.
- **conversation** `object` _required_ — Conversation data of the provided conversation ID.

```json
{
  "success": true,
  "conversation": {
    "id": "tDtDnQdgm2LXpyiqYvZ6",
    "locationId": "tDtDnQdgm2LXpyiqYvZ6",
    "contactId": "tDtDnQdgm2LXpyiqYvZ6",
    "assignedTo": "tDtDnQdgm2LXpyiqYvZ6",
    "userId": "tDtDnQdgm2LXpyiqYvZ6",
    "lastMessageBody": "Hello, this is the message body",
    "lastMessageDate": "1628008053263",
    "lastMessageType": "TYPE_CALL",
    "unreadCount": 1,
    "inbox": true,
    "starred": true,
    "deleted": false
  }
}
```
