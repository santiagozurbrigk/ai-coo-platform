---
title: "Update user availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-schedule"
seccion: "Calendars > Availability > Update user availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/schedules/:id"
---

# Update user availability schedule

```http
PUT /calendars/schedules/:id
```

Modify an existing schedule by updating its rules, timezone, and name All fields are optional - only provided fields will be updated.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Unique identifier of the schedule to update

### Request body (application/json)

**Body required**

- **name** `string` — Human-readable name for the schedule
- **rules** `object[]` — Updated schedule rules defining when the schedule is active
- **timezone** `string` — Updated timezone for the schedule (IANA timezone identifier) **Possible values:** Value must match regular expression `^[A-Za-z_]+/[A-Za-z_]+$`

```json
{
  "name": "Updated Business Hours",
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

Schedule updated successfully

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
