---
title: "Get Appointment"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-appointment"
seccion: "Calendars > Calendar Events > Get Appointment"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/events/appointments/:eventId"
---

# Get Appointment

```http
GET /calendars/events/appointments/:eventId
```

Get appointment by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **eventId** `string` _required_ — Event Id or Instance id. For recurring appointments send masterEventId to modify original series.

### Response (200 · application/json)

Successful response

**Schema**

- **event** `object` — Calendar event object

```json
{
  "event": {
    "id": "ocQHyuzHvysMo5N5VsXc",
    "calendarId": "CVokAlI8fgw4WjWoC3IS",
    "title": "Appointment with John"
  }
}
```
