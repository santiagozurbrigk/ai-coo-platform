---
title: "Create notification"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/create-event-notification"
seccion: "Calendars > Calendar Notifications > Create notification"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/:calendarId/notifications"
---

# Create notification

```http
POST /calendars/:calendarId/notifications
```

Create Calendar notifications, either one or multiple. All notification settings must be for single calendar only

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar ID

### Request body (application/json)

**Body array required**

  Array [

  ]

```json
[
  {
    "receiverType": "user",
    "channel": "email",
    "notificationType": "confirmation",
    "isActive": true,
    "templateId": "MwPcayliwcdoUFzvbTok",
    "body": "Your appointment has been confirmed.",
    "subject": "Appointment Confirmation",
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
    "additionalEmailIds": [
      "[email protected]",
      "[email protected]"
    ],
    "additionalPhoneNumbers": [
      "+919876744444",
      "+919876744445"
    ],
    "selectedUsers": [
      "userId1",
      "userId2",
      "sub_account_admin"
    ],
    "fromAddress": "[email protected]",
    "fromName": "Acme Scheduling",
    "fromNumber": "+15551234567"
  }
]
```

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
