---
title: "Delete Event"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-event"
seccion: "Calendars > Calendar Events > Delete Event"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/events/:eventId"
---

# Delete Event

```http
DELETE /calendars/events/:eventId
```

Delete event by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **eventId** `string` _required_ — Event Id or Instance id. For recurring appointments send masterEventId to modify original series.

**Body required**

- **** `object`

```json
{}
```

### Response (201 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Whether the event was successfully deleted

```json
{
  "succeeded": true
}
```
