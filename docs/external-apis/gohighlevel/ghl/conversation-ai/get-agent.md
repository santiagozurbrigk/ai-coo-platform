---
title: "Get Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/get-agent"
seccion: "Conversation AI > Agents > Get Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversation-ai/agents/:agentId"
---

# Get Agent

```http
GET /conversation-ai/agents/:agentId
```

Retrieves a specific AI agent by its ID. Returns the complete agent configuration including name, status, actions, and settings.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_ — Conversations AI agent id

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` _required_ — Unique identifier for the agent.
- **name** `string` _required_ — Name of the agent.
- **businessName** `string` — Name of the business the agent represents.
- **mode** `string` _required_ — Current operating mode of the agent.
  - Available options: `off`, `suggestive`, `auto-pilot`
- **channels** `string[]` _required_ — Communication channels the agent operates on.
  - Available options: `IG`, `FB`, `SMS`, `WebChat`, `WhatsApp`, `Live_Chat`
- **waitTime** `number` _required_ — Wait time before agent responds.
- **waitTimeUnit** `string` _required_ — Unit for wait time.
  - Available options: `minutes`, `seconds`
- **sleepEnabled** `boolean` _required_ — Indicates if sleep functionality is enabled.
- **sleepTime** `number` — Duration of sleep period.
- **sleepTimeUnit** `string` — Unit of sleep time.
  - Available options: `hours`, `minutes`, `seconds`
- **actions** `object[]` _required_ — List of actions associated with this agent.
- **isPrimary** `boolean` _required_ — Indicates if this agent is a primary agent.
- **autoPilotMaxMessages** `number` _required_ — Maximum number of messages in auto-pilot mode before requiring human intervention.
- **goal** `string` — The goal of the agent.
- **personality** `string` — Personality traits of the agent.
- **instructions** `string` — Instructions for the agent.
- **knowledgeBaseIds** `string[]` — Array of knowledge base IDs associated with this agent.
- **sleepOnManualMessage** `boolean` — Whether the bot sleeps on manual outbound messages.
- **sleepOnWorkflowMessage** `boolean` — Whether the bot sleeps on workflow outbound messages.

```json
{
  "id": "emp_123",
  "name": "John Doe",
  "businessName": "Tech Corp",
  "mode": "auto-pilot",
  "channels": [
    "SMS",
    "Live_Chat"
  ],
  "waitTime": 30,
  "waitTimeUnit": "seconds",
  "sleepTime": 2,
  "sleepTimeUnit": "hours",
  "actions": [
    {
      "id": "actionId123",
      "type": "triggerWorkflow"
    }
  ],
  "isPrimary": false,
  "autoPilotMaxMessages": 25,
  "goal": "Assist customers with inquiries",
  "personality": "Friendly and helpful",
  "instructions": "Provide excellent customer service",
  "knowledgeBaseIds": [
    "kb_123",
    "kb_456"
  ],
  "sleepOnManualMessage": false,
  "sleepOnWorkflowMessage": false
}
```
