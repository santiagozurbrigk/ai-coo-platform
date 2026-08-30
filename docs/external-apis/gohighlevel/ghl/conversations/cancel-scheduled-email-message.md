---
title: "Cancel a scheduled email message."
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/cancel-scheduled-email-message"
seccion: "Conversations > Email > Cancel a scheduled email message."
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/conversations/messages/email/:emailMessageId/schedule"
---

# Cancel a scheduled email message.

```http
DELETE /conversations/messages/email/:emailMessageId/schedule
```

Post the messageId for the API to delete a scheduled email message.

## Request

### Path parameters

- **emailMessageId** `string` _required_ — Email Message Id

### Response (200 · application/json)

The scheduled email message was cancelled successfully

**Schema**

- **status** `number` _required_ — HTTP Status code of the request
- **message** `string` _required_ — Error message of the request

```json
{
  "status": 404,
  "message": "Failed cancel the scheduled message"
}
```
