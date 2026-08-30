---
title: "Get Task"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-task"
seccion: "Contacts > Tasks > Get Task"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/:contactId/tasks/:taskId"
---

# Get Task

```http
GET /contacts/:contactId/tasks/:taskId
```

Get Task

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **taskId** `string` _required_ — Task Id

### Response (200 · application/json)

Successful response

**Schema**

- **task** `object` — Task details

```json
{
  "task": {
    "id": "lJpzYrWdpkC2hX6t2yue",
    "title": "test",
    "body": "testing",
    "assignedTo": "tesTUcmRxWrjqzJS8EjkxNK",
    "dueDate": "2021-07-08T02:30:00.000Z",
    "completed": true,
    "contactId": "lJpzYrWdpkC2hX6t2yue"
  }
}
```
