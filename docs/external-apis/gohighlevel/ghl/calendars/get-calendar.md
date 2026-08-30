---
title: "Get Calendar"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-calendar"
seccion: "Calendars > Calendars > Get Calendar"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/:calendarId"
---

# Get Calendar

```http
GET /calendars/:calendarId
```

Get calendar by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar Id

### Response (200 · application/json)

Successful response

**Schema**

- **calendar** `object` _required_ — Calendar details

```json
{
  "calendar": {
    "id": "0TkCdp9PfvLeWKYRRvIz",
    "name": "test calendar",
    "locationId": "ocQHyuzHvysMo5N5VsXc"
  }
}
```
