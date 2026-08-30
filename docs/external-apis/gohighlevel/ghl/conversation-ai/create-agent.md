---
title: "Create an Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/create-agent"
seccion: "Conversation AI > Agents > Create an Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversation-ai/agents"
---

# Create an Agent

```http
POST /conversation-ai/agents
```

Creates a new AI agent for the location. The agent will be created with the specified configuration including name, role, actions, and behavior settings.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Name of the agent.
- **businessName** `string` — Name of the business the agent represents.
- **mode** `string` — Mode of operation - OFF, SUGGESTIVE, or AUTO_PILOT
  - Available options: `off`, `suggestive`, `auto-pilot`
- **channels** `string[]` — Communication channels the agent can operate on
  - Available options: `IG`, `FB`, `SMS`, `WebChat`, `WhatsApp`, `Live_Chat`
- **isPrimary** `boolean` — Indicates if this agent is a primary agent.

  **Default value:**

  `false`

- **waitTime** `number` — Wait time before agent responds (max 5 for minutes, 300 for seconds)

  **Default value:**

  `2`

- **waitTimeUnit** `string` — Unit for wait time - SECONDS or MINUTES
  - Available options: `minutes`, `seconds`
- **sleepEnabled** `boolean` — Indicates if sleep functionality is enabled.

  **Default value:**

  `false`

- **sleepTime** `number` — Duration of sleep period (required if sleepEnabled is true). Set to null for indefinite sleep. (max 2880 for minutes, 172800 for seconds, 48 for hours)
- **sleepTimeUnit** `string` — Unit of sleep time - HOURS, MINUTES, or SECONDS (required if sleepEnabled is true). Set to null for indefinite sleep.
  - Available options: `hours`, `minutes`, `seconds`
- **personality** `string` _required_ — Personality traits of the agent.
- **goal** `string` _required_ — The goal of the agent.
- **instructions** `string` _required_ — Instructions for the agent.
- **autoPilotMaxMessages** `number` — Maximum number of messages in auto-pilot mode before requiring human intervention. (max: 100, min: 1)

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
  "mode": "auto-pilot",
  "channels": [
    "SMS",
    "Live_Chat",
    "WhatsApp"
  ],
  "isPrimary": true,
  "waitTime": 2,
  "waitTimeUnit": "seconds",
  "sleepTime": 2,
  "sleepTimeUnit": "hours",
  "personality": "Friendly and helpful",
  "goal": "Assist customers with inquiries.",
  "instructions": "Provide  customer service.",
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

### Response (201 · application/json)

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
