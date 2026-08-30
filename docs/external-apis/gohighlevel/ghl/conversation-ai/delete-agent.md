---
title: "Delete Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/delete-agent"
seccion: "Conversation AI > Agents > Delete Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/conversation-ai/agents/:agentId"
---

# Delete Agent

```http
DELETE /conversation-ai/agents/:agentId
```

Deletes an AI agent permanently. This action cannot be undone. All associated configurations and conversation history will be removed.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_ — Conversations AI agent id

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Indicates if the agent was deleted successfully.
- **id** `string` _required_ — Unique identifier of the deleted agent.

```json
{
  "success": true,
  "id": "emp_123"
}
```
