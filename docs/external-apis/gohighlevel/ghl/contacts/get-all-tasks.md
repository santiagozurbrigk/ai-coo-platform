---
title: "Get all Tasks"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-all-tasks"
seccion: "Contacts > Tasks > Get all Tasks"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/:contactId/tasks"
---

# Get all Tasks

```http
GET /contacts/:contactId/tasks
```

Get all Tasks

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Response (200 · application/json)

Successful response

**Schema**

- **tasks** `object[]` — List of tasks

```json
{
  "tasks": [
    {
      "id": "lJpzYrWdpkC2hX6t2yue",
      "title": "test",
      "body": "testing",
      "assignedTo": "tesTUcmRxWrjqzJS8EjkxNK",
      "dueDate": "2021-07-08T02:30:00.000Z",
      "completed": true,
      "contactId": "lJpzYrWdpkC2hX6t2yue"
    }
  ]
}
```
