---
title: "Delete Notification"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-event-notification"
seccion: "Calendars > Calendar Notifications > Delete Notification"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/:calendarId/notifications/:notificationId"
---

# Delete Notification

```http
DELETE /calendars/:calendarId/notifications/:notificationId
```

Delete notification

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar ID
- **notificationId** `string` _required_ — Notification ID

### Response (200 · application/json)

Successful response

**Schema**

- **message** `string` _required_ — Result of delete/update operation

```json
{
  "message": "Notification deleted successfully"
}
```
