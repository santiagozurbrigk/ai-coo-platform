---
title: "List Agents (Deprecated)"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/get-agents-deprecated"
seccion: "AI Agent Studio > Agents > List Agents (Deprecated)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/agent-studio/public-api/agents"
---

# List Agents (Deprecated)

```http
GET /agent-studio/public-api/agents
```

> deprecated
>
> This endpoint has been deprecated and may be replaced or removed in future versions of the API.
>

**Deprecated endpoint - use GET /agent instead.**

Lists all active agents that have a published production version for the specified location. locationId is required parameter. Supports pagination using limit and offset.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **limit** `string` _required_
- **offset** `string` _required_
- **source** `string`

### Response (200 · application/json)

Agents retrieved successfully

**Schema**

- **success** `boolean` _required_ — Success status
- **message** `string` _required_ — Response message
- **agents** `object[]` _required_ — List of agents with metadata
- **pagination** `object` _required_ — Pagination metadata

```json
{
  "success": true,
  "message": "Agents retrieved successfully",
  "agents": [
    {
      "agentId": "p1q2r3s4t5u6v7w8x9y0z1a2",
      "name": "Marketing Assistant",
      "description": "AI agent specialized in marketing strategy and content creation",
      "locationId": "C2QujeCh8ZnC7al2InWR",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-02-20T14:45:00.000Z"
    },
    {
      "agentId": "b3c4d5e6f7g8h9i0j1k2l3m4",
      "name": "Customer Support Bot",
      "description": "AI agent for handling customer inquiries and support tickets",
      "locationId": "C2QujeCh8ZnC7al2InWR",
      "status": "active",
      "createdAt": "2024-01-10T09:15:00.000Z",
      "updatedAt": "2024-02-18T16:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```
