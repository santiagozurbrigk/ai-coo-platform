---
title: "Delete Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/voice-ai/delete-agent"
seccion: "Voice AI > Agents > Delete Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/voice-ai/agents/:agentId"
---

# Delete Agent

```http
DELETE /voice-ai/agents/:agentId
```

Delete a voice AI agent and all its configurations

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_ — Unique agent identifier

### Query parameters

- **locationId** `string` _required_ — Location ID

### Response (204)

Agent deleted successfully
