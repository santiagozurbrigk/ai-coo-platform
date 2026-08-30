---
title: "Create Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/create-agent"
seccion: "AI Agent Studio > Agents > Create Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/agent-studio/agent"
---

# Create Agent

```http
POST /agent-studio/agent
```

Creates a new agent with staging version. The agent will be created with an initial staging version that can later be promoted to production.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **source** `string`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **name** `string` — Name of the agent
- **description** `string` — Description of the agent
- **agencyId** `string` — Agency ID
- **authorId** `string` — Author ID
- **authorName** `string` — Author name
- **authorEmail** `string` — Author email
- **status** `string` _required_ — Status of the agent
  - Available options: `active`, `inactive`, `archived`
- **version** `object` _required_ — Version data for the agent including nodes, edges, and configuration
- **nodes** `string[]` — Nodes array (deprecated, prefer using version.nodes)
- **edges** `string[]` — Edges array (deprecated, prefer using version.edges)

```json
{
  "locationId": "C2QujeCh8ZnC7al2InWR",
  "name": "Customer Support Agent",
  "description": "AI agent specialized in handling customer inquiries and support tickets",
  "agencyId": "gjL2sFNXJfJYa3d2OYSN",
  "authorId": "usr_abc123def456",
  "authorName": "John Doe",
  "authorEmail": "[email protected]",
  "status": "active",
  "version": {
    "versionName": "Version 1",
    "description": "Initial version",
    "nodes": [],
    "edges": [],
    "uiNodes": [],
    "uiEdges": [],
    "globalVariables": [],
    "inputVariables": [],
    "runtimeVariables": [],
    "scopes": []
  },
  "nodes": [],
  "edges": []
}
```

### Response (201 · application/json)

Agent created successfully

**Schema**

- **success** `boolean` _required_ — Success status
- **message** `string` _required_ — Response message
- **agent** `object` _required_ — Created agent data with metadata
- **versions** `array` _required_ — Created versions array (initial staging version)

```json
{
  "success": true,
  "message": "Agent created successfully with staging version.",
  "agent": {
    "agentId": "p1q2r3s4t5u6v7w8x9y0z1a2",
    "name": "Customer Support Agent",
    "description": "AI agent specialized in handling customer inquiries and support tickets",
    "locationId": "C2QujeCh8ZnC7al2InWR",
    "agencyId": "gjL2sFNXJfJYa3d2OYSN",
    "status": "active",
    "authorId": "usr_abc123def456",
    "folderId": "C2QujeCh8ZnC7al2InWR",
    "folderName": null,
    "createdAt": "2024-02-27T10:30:00.000Z",
    "updatedAt": "2024-02-27T10:30:00.000Z"
  },
  "versions": [
    {
      "versionId": "v1a2b3c4d5e6f7g8h9i0",
      "agentId": "p1q2r3s4t5u6v7w8x9y0z1a2",
      "versionName": "Customer Support Agent v1",
      "state": "staging",
      "isPublished": false,
      "version": 1,
      "createdAt": "2024-02-27T10:30:00.000Z"
    }
  ]
}
```
