---
title: "Delete Task"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/delete-task"
seccion: "Contacts > Tasks > Delete Task"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/contacts/:contactId/tasks/:taskId"
---

# Delete Task

```http
DELETE /contacts/:contactId/tasks/:taskId
```

Delete Task

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

- **succeeded** `boolean` — Whether the task was successfully deleted
- **succeded** `boolean` — Legacy misspelling of `succeeded`. Deprecated; use `succeeded`.

```json
{
  "succeeded": true
}
```
