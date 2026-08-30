---
title: "Delete Agent Action"
source: "https://marketplace.gohighlevel.com/docs/ghl/voice-ai/delete-action"
seccion: "Voice AI > Actions > Delete Agent Action"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/voice-ai/actions/:actionId"
---

# Delete Agent Action

```http
DELETE /voice-ai/actions/:actionId
```

Delete an existing action from a voice AI agent. This permanently removes the action and its configuration.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **actionId** `string` _required_ — Unique identifier for the action

### Query parameters

- **locationId** `string` _required_ — Location ID
- **agentId** `string` _required_ — Agent ID the action is attached to

### Response (204)

Action deleted successfully
