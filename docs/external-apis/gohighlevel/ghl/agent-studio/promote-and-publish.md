---
title: "Promote to Production"
source: "https://marketplace.gohighlevel.com/docs/ghl/agent-studio/promote-and-publish"
seccion: "AI Agent Studio > Agents > Promote to Production"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/agent-studio/agent/versions/:versionId/publish"
---

# Promote to Production

```http
POST /agent-studio/agent/versions/:versionId/publish
```

Promotes a draft version to production.

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
- **userId** `string` — User ID performing the promotion action
- **userName** `string` — User name performing the promotion action
- **userEmail** `string` — User email performing the promotion action

```json
{
  "locationId": "C2QujeCh8ZnC7al2InWR",
  "userId": "usr_abc123def456",
  "userName": "John Doe",
  "userEmail": "[email protected]"
}
```

### Response (200 · application/json)

Version promoted and published successfully

**Schema**

- **success** `boolean` _required_ — Success status
- **message** `string` _required_ — Response message
- **data** `object` _required_ — Result data with production and new draft version details

```json
{
  "success": true,
  "message": "Draft published to production successfully. New draft version created for future edits.",
  "data": {
    "productionVersion": {
      "versionId": "v1a2b3c4d5e6f7g8h9i0",
      "agentId": "p1q2r3s4t5u6v7w8x9y0z1a2",
      "versionName": "Customer Support Agent v2",
      "state": "prod",
      "isPublished": true,
      "version": 2,
      "publishedAt": "2024-02-27T12:00:00.000Z",
      "publishedBy": "usr_abc123def456",
      "publishedByName": "John Doe",
      "publishedByEmail": "[email protected]"
    },
    "newDraftVersion": {
      "versionId": "v2b3c4d5e6f7g8h9i0j1",
      "agentId": "p1q2r3s4t5u6v7w8x9y0z1a2",
      "versionName": "Customer Support Agent v3",
      "state": "draft",
      "isPublished": false,
      "version": 3,
      "createdAt": "2024-02-27T12:00:00.000Z"
    }
  }
}
```
