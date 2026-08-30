---
title: "Get Conversation"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/get-conversation"
seccion: "Conversations > Conversations > Get Conversation"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversations/:conversationId"
---

# Get Conversation

```http
GET /conversations/:conversationId
```

Get the conversation details based on the conversation ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **conversationId** `string` _required_ — Conversation ID as string

### Response (200 · application/json)

Successful response

**Schema**

- **contactId** `string` _required_ — Unique identifier of the contact associated with this conversation
- **locationId** `string` _required_ — Unique identifier of the business location where this conversation takes place
- **deleted** `boolean` _required_ — Flag indicating if this conversation has been moved to trash/deleted
- **inbox** `boolean` _required_ — Flag indicating if this conversation is currently in the main inbox view
- **type** `number` _required_ — Communication channel type for this conversation: 1 (Phone), 2 (Email), 3 (Facebook Messenger), 4 (Review), 5 (Group SMS), 6 (Internal Chat - coming soon)
- **unreadCount** `number` _required_ — Number of messages in this conversation that have not been read by the user
- **assignedTo** `string` — Unique identifier of the team member currently responsible for handling this conversation
- **id** `string` _required_ — Unique identifier for this specific conversation thread
- **starred** `boolean` — Flag indicating if this conversation has been marked as important/starred by the user

```json
{
  "contactId": "ve9EPM428kjkvShlRW1KT",
  "locationId": "ve9EPM428kjkvShlRW1KT",
  "deleted": false,
  "inbox": true,
  "type": 0,
  "unreadCount": 1,
  "assignedTo": "ve9EPM428kjkvShlRW1KT",
  "id": "ve9EPM428kjkvShlRW1KT",
  "starred": true
}
```
