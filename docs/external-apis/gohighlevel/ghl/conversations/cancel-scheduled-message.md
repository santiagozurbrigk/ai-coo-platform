---
title: "Cancel a scheduled message."
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/cancel-scheduled-message"
seccion: "Conversations > Messages > Cancel a scheduled message."
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/conversations/messages/:messageId/schedule"
---

# Cancel a scheduled message.

```http
DELETE /conversations/messages/:messageId/schedule
```

Post the messageId for the API to delete a scheduled message.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **messageId** `string` _required_ — Message Id

### Response (200 · application/json)

The scheduled message was cancelled successfully

**Schema**

- **status** `number` _required_ — HTTP Status code of the request
- **message** `string` _required_ — Error message of the request

```json
{
  "status": 404,
  "message": "Failed cancel the scheduled message"
}
```
