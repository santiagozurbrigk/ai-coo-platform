---
title: "Delete Conversation"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/delete-conversation"
seccion: "Conversations > Conversations > Delete Conversation"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/conversations/:conversationId"
---

# Delete Conversation

```http
DELETE /conversations/:conversationId
```

Delete the conversation details based on the conversation ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **conversationId** `string` _required_ — Conversation ID as string

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Boolean value as the API response.

```json
{
  "success": true
}
```
