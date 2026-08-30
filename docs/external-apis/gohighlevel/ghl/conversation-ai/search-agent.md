---
title: "Search Agents"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/search-agent"
seccion: "Conversation AI > Agents > Search Agents"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversation-ai/agents/search"
---

# Search Agents

```http
GET /conversation-ai/agents/search
```

Searches for AI agents based on various criteria including name, status, and configuration. Supports advanced filtering and full-text search capabilities.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **startAfter** `string` — Start after is the agent id to start after, Serving as skip, send empty when first page
- **limit** `number` — Records per page
- **query** `string` — query to search on agent name, must be provided in lowercase

### Response (200 · application/json)

Successful response

**Schema**

- **agents** `object[]` _required_ — List of agents matching the search criteria.
- **totalCount** `number` _required_ — Total number of agents in the location (unfiltered count).
- **count** `number` _required_ — Number of agents in the current response (filtered/paginated count).

```json
{
  "agents": [
    {
      "id": "emp_123",
      "name": "John Doe",
      "businessName": "Tech Corp",
      "mode": "auto-pilot",
      "channels": [
        "SMS",
        "LIVE_CHAT"
      ],
      "waitTime": 30,
      "waitTimeUnit": "seconds",
      "sleepTime": 2,
      "sleepTimeUnit": "hours",
      "actions": [
        {
          "id": "action_123",
          "type": "triggerWorkflow"
        }
      ],
      "isPrimary": false,
      "autoPilotMaxMessages": 25,
      "goal": {
        "prompt": "Assist customers",
        "type": "custom",
        "actionId": null
      },
      "knowledgeBaseIds": [
        "kb_123",
        "kb_456"
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "sleepOnManualMessage": false,
      "sleepOnWorkflowMessage": false
    }
  ],
  "totalCount": 100,
  "count": 25
}
```
