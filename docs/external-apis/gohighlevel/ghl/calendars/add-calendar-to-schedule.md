---
title: "Apply user availability schedule to a calendar"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/add-calendar-to-schedule"
seccion: "Calendars > Availability > Apply user availability schedule to a calendar"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/schedules/:id/associations/:calendarId"
---

# Apply user availability schedule to a calendar

```http
PUT /calendars/schedules/:id/associations/:calendarId
```

Associates a calendar with the given schedule by adding the calendarId to a schedule

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Unique identifier of the schedule
- **calendarId** `string` _required_ — Unique identifier of the team calendar to add to the schedule

### Response (200 · application/json)

Calendar successfully added to schedule

**Schema**

- **success** `boolean` — Whether the operation was successful

```json
{
  "success": true
}
```
