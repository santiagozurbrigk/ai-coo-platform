---
title: "List Actions for an Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/list-actions"
seccion: "Conversation AI > Actions > List Actions for an Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversation-ai/agents/:agentId/actions/list"
---

# List Actions for an Agent

```http
GET /conversation-ai/agents/:agentId/actions/list
```

List for actions for an agent

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_

### Response (200 · application/json)

Success

**Schema**

- **data** `object[]` _required_ — Grouped actions by type
- **success** `boolean` _required_ — Success status of the request

```json
{
  "data": [
    {
      "id": "actionId123",
      "name": "Trigger Workflow",
      "type": "triggerWorkflow",
      "agentId": "agentId123",
      "details": {
        "workflowIds": [
          "workflow123",
          "workflow456"
        ],
        "triggerCondition": "When user requests appointment",
        "triggerMessage": "Workflow triggered successfully"
      }
    }
  ],
  "success": true
}
```
