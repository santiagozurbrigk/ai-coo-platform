---
title: "Get Blocked Slots"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-blocked-slots"
seccion: "Calendars > Calendar Events > Get Blocked Slots"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/blocked-slots"
---

# Get Blocked Slots

```http
GET /calendars/blocked-slots
```

Get Blocked Slots

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id
- **userId** `string` — User Id - Owner of an appointment. Either of userId, groupId or calendarId is required
- **calendarId** `string` — Either of calendarId, userId or groupId is required
- **groupId** `string` — Either of groupId, calendarId or userId is required
- **startTime** `string` _required_ — Start Time (in millis)
- **endTime** `string` _required_ — End Time (in millis)

### Response (200 · application/json)

Successful response

**Schema**

- **events** `object[]` — List of calendar events

```json
{
  "events": [
    {
      "id": "ocQHyuzHvysMo5N5VsXc",
      "calendarId": "CVokAlI8fgw4WjWoC3IS",
      "title": "Appointment with John"
    }
  ]
}
```
