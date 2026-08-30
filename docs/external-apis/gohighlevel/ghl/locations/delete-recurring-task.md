---
title: "Delete Recurring Task"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/delete-recurring-task"
seccion: "Sub-Account (Formerly location) > Recurring Tasks > Delete Recurring Task"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/locations/:locationId/recurring-tasks/:id"
---

# Delete Recurring Task

```http
DELETE /locations/:locationId/recurring-tasks/:id
```

Delete Recurring Task

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Recurring Task Id
- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` _required_ — Recurring Task Id
- **success** `boolean` _required_ — Success

```json
{
  "id": "sx6wyHhbFdRXh302Lunr",
  "success": true
}
```
