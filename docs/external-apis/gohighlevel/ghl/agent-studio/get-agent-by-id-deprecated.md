---
title: "Get Agent (Deprecated)"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/get-agent-by-id-deprecated"
seccion: "AI Agent Studio > Agents > Get Agent (Deprecated)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/agent-studio/public-api/agents/:agentId"
---

# Get Agent (Deprecated)

```http
GET /agent-studio/public-api/agents/:agentId
```

> deprecated
>
> This endpoint has been deprecated and may be replaced or removed in future versions of the API.
>

**Deprecated endpoint - use GET /agent/ :agentId instead.**

Gets a specific agent by its ID for the specified location with all its versions. locationId is required parameter. The agent must have active status.

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

Agent retrieved successfully

**Schema**

- **success** `boolean` _required_ — Success status
- **message** `string` _required_ — Response message
- **agent** `object` _required_ — Agent metadata with all active versions
- **traceId** `string` — Request trace ID for debugging

```json
{
  "success": true,
  "message": "Agent retrieved successfully",
  "agent": {
    "id": "d6a6792d-0d50-4e8f-9c3b-ecd8096d0bdd",
    "agentId": "AgfS2JXWsSN8aXb5c4d2",
    "name": "Customer Support Agent",
    "description": "AI agent for customer support",
    "agencyId": "5DP4iH6HLkQsiKESj6rh",
    "locationId": "C2QujeCh8ZnC7al2InWR",
    "productSlug": "agent_studio",
    "productId": "agent_studio",
    "authorId": "usr_123",
    "status": "active",
    "folderId": "vEoIigWSAw1BQA9DEchD",
    "folderName": "Default Agents",
    "createdAt": "2026-03-06T10:37:01.013Z",
    "updatedAt": "2026-03-06T10:37:01.014Z",
    "deleted": false,
    "productionVersion": {
      "versionId": "Ver1K8sSF2nC7al5InWz",
      "versionName": "Content Creation Agent v1",
      "isPublished": true,
      "inputVariables": [],
      "updatedAt": "2026-03-02T06:53:40.570Z"
    },
    "versions": [
      {
        "id": "3f9d9ab7-5ca4-4e64-8472-eab9e77a0fe3",
        "versionId": "Ver1K8sSF2nC7al5InWz",
        "agentId": "AgfS2JXWsSN8aXb5c4d2",
        "agencyId": "5DP4iH6HLkQsiKESj6rh",
        "locationId": "C2QujeCh8ZnC7al2InWR",
        "versionName": "v1",
        "description": "AI agent for customer support",
        "state": "staging",
        "isPublished": false,
        "scopes": [],
        "nodes": [],
        "edges": [],
        "uiNodes": [],
        "uiEdges": [],
        "globalVariables": [],
        "inputVariables": [],
        "runtimeVariables": [],
        "viewport": {
          "x": 0,
          "y": 0,
          "zoom": 1
        },
        "globalConfig": {},
        "createdAt": "2026-03-06T10:37:01.079Z",
        "updatedAt": "2026-03-06T10:37:01.079Z",
        "deleted": false,
        "storedInBucket": true,
        "bucketFilePath": "agent-definitions/5DP4iH6HLkQsiKESj6rh/vEoIigWSAw1BQA9DEchD/d6a6792d-0d50-4e8f-9c3b-ecd8096d0bdd/3f9d9ab7-5ca4-4e64-8472-eab9e77a0fe3.json"
      }
    ]
  },
  "traceId": "22dbda99-13d3-4b4d-a30e-c468334e2178"
}
```
