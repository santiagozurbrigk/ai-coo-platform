---
title: "Update Task"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/update-task"
seccion: "Contacts > Tasks > Update Task"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/contacts/:contactId/tasks/:taskId"
---

# Update Task

```http
PUT /contacts/:contactId/tasks/:taskId
```

Update Task

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **taskId** `string` _required_ — Task Id

### Request body (application/json)

**Body required**

- **title** `string` — Title of the task
- **body** `string` — Body or description of the task
- **dueDate** `string` — Due date of the task (ISO 8601 format)
- **completed** `boolean` — Whether the task is completed
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
