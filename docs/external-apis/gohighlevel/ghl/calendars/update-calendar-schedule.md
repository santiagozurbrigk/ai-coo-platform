---
title: "Update event calendar availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-calendar-schedule"
seccion: "Calendars > Availability > Update event calendar availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/schedules/event-calendar/:calendarId"
---

# Update event calendar availability schedule

```http
PUT /calendars/schedules/event-calendar/:calendarId
```

Update the availability schedule for a specific event calendar. Only provided fields will be updated. The calendar ID is provided in the path.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Unique identifier of the event calendar

### Request body (application/json)

**Body required**

- **rules** `object[]` — Updated schedule rules defining when the schedule is active
- **timezone** `string` — Updated timezone for the schedule (IANA timezone identifier) **Possible values:** Value must match regular expression `^[A-Za-z_]+/[A-Za-z_]+$`

```json
{
  "rules": [
    {
      "type": "wday",
      "day": "monday",
      "intervals": [
        {
          "from": "08:00",
          "to": "18:00"
        }
      ]
    }
  ],
  "timezone": "America/Los_Angeles"
}
```

### Response (200 · application/json)

Schedule updated successfully for the event calendar

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
