---
title: "Get event calendar availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-calendar-schedule"
seccion: "Calendars > Availability > Get event calendar availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/schedules/event-calendar/:calendarId"
---

# Get event calendar availability schedule

```http
GET /calendars/schedules/event-calendar/:calendarId
```

Retrieve the availability schedule for a specific event calendar. Returns the schedule associated with the calendar ID provided in the path.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Unique identifier of the event calendar

### Response (200 · application/json)

Schedule retrieved successfully for the event calendar

**Schema**

- **schedule** `object` _required_ — The event calendar schedule

```json
{
  "schedule": {
    "timezone": "America/New_York",
    "rules": [
      {
        "type": "weekday",
        "day": "monday",
        "intervals": [
          {
            "from": "09:00",
            "to": "17:00"
          }
        ]
      }
    ],
    "calendarId": "WvVX9LpvlBO6K506xLbp"
  }
}
```
