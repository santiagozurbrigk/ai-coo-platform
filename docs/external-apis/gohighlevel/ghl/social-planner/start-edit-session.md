---
title: "Start or resume an edit session"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/start-edit-session"
seccion: "Social Planner > Category Queue > Start or resume an edit session"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/category/queues/:queueId/edit/start"
---

# Start or resume an edit session

```http
POST /social-media-posting/category/queues/:queueId/edit/start
```

Creates a draft copy of queue items for editing. Changes are staged until saved or discarded.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **queueId** `string` _required_

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID

```json
{
  "locationId": "609e126a1c4ae1001291e1b5"
}
```

### Response (201 · application/json)

Edit session started successfully.

**Schema**

- **success** `boolean` _required_
- **statusCode** `number` _required_
- **results** `object` _required_
- **traceId** `string`

```json
{
  "success": true,
  "statusCode": 201,
  "results": {
    "message": "Edit session started successfully",
    "sessionId": "60af88475f1b2c001f5d5f4b",
    "itemCount": 25
  },
  "traceId": "string"
}
```
