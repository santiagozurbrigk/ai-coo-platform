---
title: "Create Task"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/create-task"
seccion: "Contacts > Tasks > Create Task"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/:contactId/tasks"
---

# Create Task

```http
POST /contacts/:contactId/tasks
```

Create Task

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Request body (application/json)

**Body required**

- **title** `string` _required_ — Title of the task
- **body** `string` — Body or description of the task
- **dueDate** `string` _required_ — Due date of the task (ISO 8601 format)
- **completed** `boolean` _required_ — Whether the task is completed
- **assignedTo** `string` — User Id to whom the task is assigned

```json
{
  "title": "First Task",
  "body": "loram ipsum",
  "dueDate": "2020-10-25T11:00:00Z",
  "completed": true,
  "assignedTo": "hxHGVRb1YJUscrCB8eXK"
}
```

### Response (201 · application/json)

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
