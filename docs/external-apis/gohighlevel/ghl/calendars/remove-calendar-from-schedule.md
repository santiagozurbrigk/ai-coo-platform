---
title: "Remove user availability schedule from a calendar"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/remove-calendar-from-schedule"
seccion: "Calendars > Availability > Remove user availability schedule from a calendar"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/schedules/:id/associations/:calendarId"
---

# Remove user availability schedule from a calendar

```http
DELETE /calendars/schedules/:id/associations/:calendarId
```

Removes the association between a team calendar and the given schedule by removing the calendarId from the schedule

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Unique identifier of the schedule
- **calendarId** `string` _required_ — Unique identifier of the calendar to remove from the schedule

### Response (200 · application/json)

Calendar successfully removed from schedule

**Schema**

- **success** `boolean` — Whether the operation was successful

```json
{
  "success": true
}
```
