---
title: "Get Free Slots"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-slots"
seccion: "Calendars > Calendars > Get Free Slots"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/:calendarId/free-slots"
---

# Get Free Slots

```http
GET /calendars/:calendarId/free-slots
```

Get free slots for a calendar between a date range. Optionally a consumer can also request free slots in a particular timezone and also for a particular user.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar Id

### Query parameters

- **startDate** `number` _required_ — Start Date (**⚠️ Important:** Date range cannot be more than 31 days)
- **endDate** `number` _required_ — End Date (**⚠️ Important:** Date range cannot be more than 31 days)
- **timezone** `string` — The timezone in which the free slots are returned
- **userId** `string` — The user for whom the free slots are returned
- **userIds** `string[]` — The users for whom the free slots are returned

### Response (200 · application/json)

Availability map keyed by date (YYYY-MM-DD)

**Schema**

- **property name*** `SlotsSchema`

```json
{
  "2024-10-28": {
    "slots": [
      "2024-10-28T10:00:00-05:00",
      "2024-10-28T11:00:00-05:00"
    ]
  },
  "2024-10-29": {
    "slots": [
      "2024-10-29T10:00:00-05:00",
      "2024-10-29T14:30:00-05:00"
    ]
  }
}
```
