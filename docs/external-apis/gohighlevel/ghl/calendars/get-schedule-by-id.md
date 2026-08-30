---
title: "Get user availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-schedule-by-id"
seccion: "Calendars > Availability > Get user availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/schedules/:id"
---

# Get user availability schedule

```http
GET /calendars/schedules/:id
```

Retrieve a specific schedule by its unique identifier. Returns detailed information including rules, timezone, and associated calendars/users.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Unique identifier of the schedule

### Response (200 · application/json)

Schedule found and retrieved successfully

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
