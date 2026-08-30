---
title: "Delete Note"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-appointment-note"
seccion: "Calendars > Appointment Notes > Delete Note"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/appointments/:appointmentId/notes/:noteId"
---

# Delete Note

```http
DELETE /calendars/appointments/:appointmentId/notes/:noteId
```

Delete Note

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **appointmentId** `string` _required_ — Appointment ID

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` — Whether the note was successfully deleted

```json
{
  "success": true
}
```
