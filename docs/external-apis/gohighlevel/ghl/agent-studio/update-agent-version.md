---
title: "Update Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/update-agent-version"
seccion: "AI Agent Studio > Agents > Update Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/agent-studio/agent/versions/:versionId"
---

# Update Agent

```http
PATCH /agent-studio/agent/versions/:versionId
```

Updates a specific agent version by versionId. Supports updating nodes, edges, variables, and configuration.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **versionId** `string` _required_

### Query parameters

- **source** `string`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID for authorization
- **versionName** `string` — Version name
- **description** `string` — Description of the version
- **nodes** `object[]` — Complete array of nodes for the agent workflow. Provide all nodes including unchanged ones.
- **edges** `object[]` — Complete array of edges connecting the nodes. Provide all edges including unchanged ones.
- **globalVariables** `object[]` — Global variables accessible throughout the agent workflow
- **inputVariables** `object[]` — Input variables required from user at execution time
- **runtimeVariables** `object[]` — Runtime variables generated during agent execution
- **globalConfig** `object` — Global configuration including prompts and settings
- **userId** `string` — User ID performing the update
- **userName** `string` — User name performing the update

```json
{
  "locationId": "C2QujeCh8ZnC7al2InWR",
  "versionName": "Customer Support Agent v2",
  "description": "Updated version with improved customer handling logic",
  "nodes": [
    {
      "nodeId": "node_1",
      "nodeName": "Start",
      "type": "start",
      "isStartNode": true
    },
    {
      "nodeId": "node_2",
      "nodeName": "LLM Node",
      "type": "llm",
      "nodeConfig": {
        "prompt": "How can I help you?",
        "llmProvider": "openai",
        "llmModel": "gpt-4"
      }
    }
  ],
  "edges": [
    {
      "startNode": "node_1",
      "endNode": "node_2"
    }
  ],
  "globalVariables": [
    {
      "key": "apiKey",
      "type": "string",
      "value": "your-api-key"
    }
  ],
  "inputVariables": [
    {
      "key": "customerName",
      "type": "string",
      "description": "Customer name for personalization"
    }
  ],
  "runtimeVariables": [
    {
      "key": "sessionId",
      "type": "string",
      "description": "Current session identifier"
    }
  ],
  "globalConfig": {
    "globalPrompt": {
      "currentPrompt": "You are a helpful customer support assistant.",
      "history": []
    }
  },
  "userId": "usr_abc123def456",
  "userName": "John Doe"
}
```

### Response (200 · application/json)

Version updated successfully

**Schema**

- **success** `boolean` _required_ — Success status
- **message** `string` _required_ — Response message
- **data** `object` _required_ — Updated agent or version data

```json
{
  "success": true,
  "message": "Agent updated successfully",
  "data": {
    "agentId": "p1q2r3s4t5u6v7w8x9y0z1a2",
    "versionId": "v1a2b3c4d5e6f7g8h9i0",
    "name": "Updated Customer Support Agent",
    "description": "Updated AI agent with enhanced customer support capabilities",
    "status": "active",
    "updatedAt": "2024-02-27T11:45:00.000Z"
  }
}
```
