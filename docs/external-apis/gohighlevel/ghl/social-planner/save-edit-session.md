---
title: "Save edit session changes"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/save-edit-session"
seccion: "Social Planner > Category Queue > Save edit session changes"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/category/queues/:queueId/edit/save"
---

# Save edit session changes

```http
POST /social-media-posting/category/queues/:queueId/edit/save
```

Applies all staged changes to the live queue and closes the edit session.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **queueId** `string` _required_

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **sessionId** `string` _required_ — Edit session ID
- **keepInDraft** `boolean` — If true, keeps the queue in DRAFT state after saving instead of automatically activating it. Only applicable when the queue is currently in DRAFT status.

  **Default value:**

  `false`

```json
{
  "locationId": "609e126a1c4ae1001291e1b5",
  "sessionId": "60af88475f1b2c001f5d5f4b",
  "keepInDraft": false
}
```

### Response (200 · application/json)

Edit session saved successfully.

**Schema**

- **success** `boolean` _required_
- **statusCode** `number` _required_
- **results** `object` _required_
- **traceId** `string`

```json
{
  "success": true,
  "statusCode": 200,
  "results": {
    "message": "Edit session saved successfully",
    "updatedSlots": [
      {
        "itemId": "60af88475f1b2c001f5d5f4b",
        "scheduledDateTime": "2023-10-15T10:00:00.000Z",
        "isSkipped": false
      }
    ],
    "totalPostsChanged": 10
  },
  "traceId": "string"
}
```
