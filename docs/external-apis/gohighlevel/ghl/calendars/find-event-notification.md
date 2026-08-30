---
title: "Get notification"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/find-event-notification"
seccion: "Calendars > Calendar Notifications > Get notification"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/:calendarId/notifications/:notificationId"
---

# Get notification

```http
GET /calendars/:calendarId/notifications/:notificationId
```

Find Event notification by notificationId

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

- **_id** `string` — Notification ID
- **receiverType** `string` — Notification recipient type
  - Available options: `contact`, `guest`, `assignedUser`, `emails`, `phoneNumbers`, `business`
- **additionalEmailIds** `string[]` — Additional email addresses to receive notifications
- **additionalPhoneNumbers** `string[]` — Additional phone numbers to receive notifications
- **channel** `string` — Notification channel
  - Available options: `email`, `inApp`, `sms`, `whatsapp`
- **notificationType** `string` — Notification type
  - Available options: `booked`, `confirmation`, `cancellation`, `reminder`, `followup`, `reschedule`
- **isActive** `boolean` — Whether the notification is active
- **additionalWhatsappNumbers** `string[]` — Additional WhatsApp numbers to receive notifications
- **templateId** `string` — Template ID for the notification
- **body** `string` — Notification body content
- **subject** `string` — Notification subject line
- **afterTime** `object[]` — Time schedules after which follow-up notifications are sent
- **beforeTime** `object[]` — Time schedules before which reminder notifications are sent
- **selectedUsers** `string[]` — Selected user IDs for the notification
- **deleted** `boolean` — Whether the notification is deleted

```json
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
```
