---
title: "Update Task Completed"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/update-task-completed"
seccion: "Contacts > Tasks > Update Task Completed"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/contacts/:contactId/tasks/:taskId/completed"
---

# Update Task Completed

```http
PUT /contacts/:contactId/tasks/:taskId/completed
```

Update Task Completed

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **taskId** `string` _required_ — Task Id

### Request body (application/json)

**Body required**

- **completed** `boolean` _required_ — Whether the task is completed

```json
{
  "completed": true
}
```

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
