---
title: "Update Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/update-agent"
seccion: "Conversation AI > Agents > Update Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/conversation-ai/agents/:agentId"
---

# Update Agent

```http
PUT /conversation-ai/agents/:agentId
```

Updates an existing AI agent's configuration. All fields in the agent configuration can be updated including name, status, actions, and behavior settings.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_ — Conversations AI agent id

### Request body (application/json)

**Body required**

- **name** `string` — Name of the agent.
- **businessName** `string` — Name of the business the agent represents.
- **mode** `string` — Mode of operation for the agent, required if primary is enabled.
  - Available options: `off`, `suggestive`, `auto-pilot`
- **channels** `string[]` — Channels the agent can use.
  - Available options: `IG`, `FB`, `SMS`, `WebChat`, `WhatsApp`, `Live_Chat`
- **isPrimary** `boolean` — Indicates if this agent is a primary agent.
- **waitTime** `number` — Wait time before agent responds (max 5 for minutes, 300 for seconds).
- **waitTimeUnit** `string` — Unit for wait time - SECONDS or MINUTES
  - Available options: `minutes`, `seconds`
- **sleepEnabled** `boolean` — Indicates if sleep functionality is enabled.
- **sleepTime** `number` — Duration of sleep period (required if sleepEnabled is true). Set to null for indefinite sleep. (max 2880 for minutes, 172800 for seconds, 48 for hours)
- **sleepTimeUnit** `string` — Unit of sleep time - HOURS, MINUTES, or SECONDS (required if sleepEnabled is true). Set to null for indefinite sleep.
  - Available options: `hours`, `minutes`, `seconds`
- **personality** `string` — Personality traits of the agent.
- **goal** `string` — The goal of the agent.
- **instructions** `string` — Instructions for the agent.
- **autoPilotMaxMessages** `number` _required_ — Maximum number of messages in auto-pilot mode before requiring human intervention. (max: 100, min: 1)

  **Default value:**

  `75`

- **knowledgeBaseIds** `string[]` — Array of knowledge base IDs associated with this agent.
- **respondToImages** `boolean` — Allow agent to respond to images

  **Default value:**

  `false`

- **respondToAudio** `boolean` — Allow agent to respond to audio

  **Default value:**

  `false`

- **sleepOnManualMessage** `boolean` — Enable sleep when a manual outbound message is sent.
- **sleepOnWorkflowMessage** `boolean` — Enable sleep when a workflow outbound message is sent.

```json
{
  "name": "John Doe",
  "businessName": "Tech Corp",
  "mode": "off",
  "channels": [
    "IG"
  ],
  "isPrimary": true,
  "waitTime": 30,
  "waitTimeUnit": "seconds",
  "sleepTime": 10,
  "sleepTimeUnit": "hours",
  "personality": "You re an AI assistant and you are friendly and helpful",
  "goal": "You are an AI assistant and you are helping customers with inquiries.",
  "instructions": "Provide excellent customer service.",
  "autoPilotMaxMessages": 75,
  "knowledgeBaseIds": [
    "string"
  ],
  "respondToImages": true,
  "respondToAudio": true,
  "sleepOnManualMessage": false,
  "sleepOnWorkflowMessage": false
}
```

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
