---
title: "Delete user availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-schedule"
seccion: "Calendars > Availability > Delete user availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/schedules/:id"
---

# Delete user availability schedule

```http
DELETE /calendars/schedules/:id
```

Permanently remove a schedule and all its associated rules. This action cannot be undone.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Unique identifier of the schedule to delete

### Response (200 · application/json)

Schedule deleted successfully

**Schema**

- **success** `boolean` — Whether the deletion was successful

```json
{
  "success": true
}
```
