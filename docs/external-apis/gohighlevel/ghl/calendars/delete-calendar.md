---
title: "Delete Calendar"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-calendar"
seccion: "Calendars > Calendars > Delete Calendar"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/:calendarId"
---

# Delete Calendar

```http
DELETE /calendars/:calendarId
```

Delete calendar by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar Id

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success

```json
{
  "success": "true"
}
```
