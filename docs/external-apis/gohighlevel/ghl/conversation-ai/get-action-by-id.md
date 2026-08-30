---
title: "Get Action by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/get-action-by-id"
seccion: "Conversation AI > Actions > Get Action by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversation-ai/agents/:agentId/actions/:actionId"
---

# Get Action by ID

```http
GET /conversation-ai/agents/:agentId/actions/:actionId
```

Retrieves detailed information about a specific action using its unique identifier. Returns the action configuration, associated agents, and performance metrics.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **actionId** `string` _required_ — The unique identifier of the action ID Attached to the agent
- **agentId** `string` _required_

### Response (200 · application/json)

Success

**Schema**

- **data** `object` _required_ — Action details
- **success** `boolean` _required_ — Success status of the request

```json
{
  "data": {
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
  },
  "success": true
}
```
