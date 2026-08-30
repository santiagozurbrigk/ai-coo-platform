---
title: "Create event calendar availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/create-calendar-schedule"
seccion: "Calendars > Availability > Create event calendar availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/schedules/event-calendar/:calendarId"
---

# Create event calendar availability schedule

```http
POST /calendars/schedules/event-calendar/:calendarId
```

Create a new availability schedule specifically for an event calendar. The calendar ID is provided in the path, and schedule rules and timezone are provided in the request body.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Unique identifier of the event calendar

### Request body (application/json)

**Body required**

- **rules** `object[]` _required_ — Schedule rules defining when the schedule is active
- **timezone** `string` _required_ — Timezone for the schedule (IANA timezone identifier) **Possible values:** Value must match regular expression `^[A-Za-z_]+/[A-Za-z_]+$`

```json
{
  "rules": [
    {
      "type": "wday",
      "day": "monday",
      "intervals": [
        {
          "from": "09:00",
          "to": "17:00"
        }
      ]
    }
  ],
  "timezone": "America/New_York"
}
```

### Response (201 · application/json)

Schedule created successfully for the event calendar

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
