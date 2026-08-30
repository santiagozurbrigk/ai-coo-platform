---
title: "Agent/Ai-Bot is typing a message indicator for live chat"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/live-chat-agent-typing"
seccion: "Conversations > Providers > Agent/Ai-Bot is typing a message indicator for live chat"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversations/providers/live-chat/typing"
---

# Agent/Ai-Bot is typing a message indicator for live chat

```http
POST /conversations/providers/live-chat/typing
```

Agent/AI-Bot will call this when they are typing a message in live chat message

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location Id
- **isTyping** `string` _required_ — Typing status
- **visitorId** `string` _required_ — visitorId is the Unique ID assigned to each Live chat visitor. visitorId will be added soon in [GET Contact API](https://marketplace.gohighlevel.com/docs/ghl/conversations/contacts/get-contact)
- **conversationId** `string` _required_ — Conversation Id

```json
{
  "locationId": "ve9EPM428h8vShlRW1KT",
  "isTyping": true,
  "visitorId": "ve9EPM428h8vShlRW1KT",
  "conversationId": "ve9EPM428h8vShlRW1KT"
}
```

### Response (201 · application/json)

Show typing indicator for live chat

**Schema**

- **success** `boolean` _required_

```json
{
  "success": true
}
```
