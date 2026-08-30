---
title: "List user availability schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-all-schedules"
seccion: "Calendars > Availability > List user availability schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/schedules/search"
---

# List user availability schedule

```http
GET /calendars/schedules/search
```

Retrieve user availability schedules based on various filters including location, calendar, and user. Supports pagination.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID to filter schedules by
- **userId** `string` _required_ — User ID to filter schedules by specific user
- **calendarId** `string` — Calendar ID for filtering schedules by specific calendar
- **skip** `number` — Number of items to skip for pagination **Possible values:** `>= 0`

  Default value:

  `0`

- **limit** `number` — Maximum number of items to return (max 500) **Possible values:** `>= 1` and `<= 500`

  Default value:

  `50`

### Response (200 · application/json)

Schedules retrieved successfully

**Schema**

- **schedules** `object[]` _required_ — Array of schedules

```json
{
  "schedules": [
    {
      "id": "IkqiJlXJ7o9h61tCHHod",
      "name": "Business Hours Schedule",
      "locationId": "ocQHyuzHvysMo5N5VsXc"
    }
  ]
}
```
