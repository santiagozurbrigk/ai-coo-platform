---
title: "Create user availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/create-schedule"
seccion: "Calendars > Availability > Create user availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/schedules"
---

# Create user availability schedule

```http
POST /calendars/schedules
```

Create new schedule with specified rules, timezone, location, user and calendar associations.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **rules** `object[]` — Schedule rules defining when the schedule is active
- **timezone** `string` _required_ — Timezone for the schedule (IANA timezone identifier) **Possible values:** Value must match regular expression `^[A-Za-z_]+/[A-Za-z_]+$`
- **locationId** `string` _required_ — Location ID where this schedule applies
- **name** `string` _required_ — Human-readable name for the schedule
- **userId** `string` _required_ — User ID associated with the schedule
- **calendarIds** `string[]` — Calendar IDs associated with the schedule

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
  "timezone": "America/New_York",
  "locationId": "IkqiJlXJ7o9h61tCHHod",
  "name": "Business Hours Schedule",
  "userId": "IkqiJlXJ7o9h61tCHHod",
  "calendarIds": [
    "WvVX9LpvlBO6K506xLbp",
    "XyZ8MnQrStUvWxYzAbCdEf"
  ]
}
```

### Response (201 · application/json)

Schedule created successfully

**Schema**

- **schedule** `object` _required_ — Schedule

```json
{
  "schedule": {
    "id": "IkqiJlXJ7o9h61tCHHod",
    "name": "Business Hours Schedule",
    "locationId": "ocQHyuzHvysMo5N5VsXc"
  }
}
```
