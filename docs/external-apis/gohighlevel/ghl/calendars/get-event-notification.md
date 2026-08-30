---
title: "Get notifications"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-event-notification"
seccion: "Calendars > Calendar Notifications > Get notifications"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/:calendarId/notifications"
---

# Get notifications

```http
GET /calendars/:calendarId/notifications
```

Get calendar notifications based on query

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar ID

### Query parameters

- **isActive** `boolean` — Filter by active status
- **deleted** `boolean` — Include deleted notifications
- **limit** `number` — Number of records to return

  Default value:

  `100`

- **skip** `number` — Number of records to skip

  Default value:

  `0`

### Response (200 · application/json)

Successful response

**Schema**

  Array [

  ]

```json
[
  {
    "_id": "629a5d0a8c3f2b001f3d4e5a",
    "receiverType": "contact",
    "additionalEmailIds": [
      "[email protected]",
      "[email protected]"
    ],
    "additionalPhoneNumbers": [
      "+919876744444",
      "+919876744445"
    ],
    "channel": "email",
    "notificationType": "confirmation",
    "isActive": true,
    "additionalWhatsappNumbers": [
      "+919876744444",
      "+919876744445"
    ],
    "templateId": "0as9d8as0d",
    "body": "This is a test notification",
    "subject": "Test Notification",
    "afterTime": [
      {
        "timeOffset": 1,
        "unit": "hours"
      }
    ],
    "beforeTime": [
      {
        "timeOffset": 1,
        "unit": "hours"
      }
    ],
    "selectedUsers": [
      "user1",
      "user2"
    ],
    "deleted": false
  }
]
```
