---
title: "Remove Action from Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/delete-action"
seccion: "Conversation AI > Actions > Remove Action from Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/conversation-ai/agents/:agentId/actions/:actionId"
---

# Remove Action from Agent

```http
DELETE /conversation-ai/agents/:agentId/actions/:actionId
```

Permanently deletes an action. This will remove the action from all associated agents and cannot be undone.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **actionId** `string` _required_ — The unique identifier of the action ID Attached to the agent
- **agentId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object` _required_ — Deleted action information
- **success** `boolean` _required_ — Success status of the request

```json
{
  "data": {
    "id": "actionId123"
  },
  "success": true
}
```
