---
title: "Update Agent Metadata"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/update-agent-metadata"
seccion: "AI Agent Studio > Agents > Update Agent Metadata"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/agent-studio/agent/:agentId"
---

# Update Agent Metadata

```http
PATCH /agent-studio/agent/:agentId
```

Updates agent metadata such as name, description, and status.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_

### Query parameters

- **source** `string`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID for authorization (cannot be updated)
- **name** `string` — Name of the agent
- **description** `string` — Description of the agent
- **status** `string` — Status of the agent
  - Available options: `active`, `inactive`, `archived`

```json
{
  "locationId": "C2QujeCh8ZnC7al2InWR",
  "name": "Updated Customer Support Agent",
  "description": "Updated AI agent with enhanced customer support capabilities",
  "status": "active"
}
```

### Response (200 · application/json)

Agent metadata updated successfully

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
