---
title: "Delete Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/delete-agent"
seccion: "AI Agent Studio > Agents > Delete Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/agent-studio/agent/:agentId"
---

# Delete Agent

```http
DELETE /agent-studio/agent/:agentId
```

Deletes an agent and all its versions.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_

### Query parameters

- **locationId** `string` _required_
- **source** `string`

### Response (200 · application/json)

Agent deleted successfully

**Schema**

- **success** `boolean` _required_ — Success status
- **message** `string` _required_ — Response message
- **agentId** `string` — Deleted agent ID

```json
{
  "success": true,
  "message": "Agent deleted successfully",
  "agentId": "p1q2r3s4t5u6v7w8x9y0z1a2"
}
```
