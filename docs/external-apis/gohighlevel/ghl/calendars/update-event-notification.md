---
title: "Update notification"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-event-notification"
seccion: "Calendars > Calendar Notifications > Update notification"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/:calendarId/notifications/:notificationId"
---

# Update notification

```http
PUT /calendars/:calendarId/notifications/:notificationId
```

Update Event notification by id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar ID
- **notificationId** `string` _required_ — Notification ID

### Request body (application/json)

**Body required**

- **receiverType** `string` — Notification recipient type
  - Available options: `contact`, `guest`, `assignedUser`, `emails`, `phoneNumbers`, `business`
- **additionalEmailIds** `string[]` — Additional email addresses to receive notifications.
- **additionalPhoneNumbers** `string[]` — Additional phone numbers to receive notifications.
- **selectedUsers** `string[]` — Selected users for in-App and business email notifications. Supports user IDs and special keyword "sub_account_admin"
- **channel** `string` — Notification channel
  - Available options: `email`, `inApp`, `sms`, `whatsapp`
- **notificationType** `string` — Notification type
  - Available options: `booked`, `confirmation`, `cancellation`, `reminder`, `followup`, `reschedule`
- **isActive** `boolean` — Is the notification active

  **Default value:**

  `true`

- **deleted** `boolean` — Marks the notification as deleted (soft delete)

  **Default value:**

  `false`

- **templateId** `string` — Template ID for email notification
- **body** `string` — Body for email notification. Not necessary for in-App notification
- **subject** `string` — Subject for email notification. Not necessary for in-App notification
- **afterTime** `object[]` — Specifies the time after which the follow-up notification should be sent. This is not required for other notification types.
- **beforeTime** `object[]` — Specifies the time before which the reminder notification should be sent. This is not required for other notification types.
- **fromAddress** `string` — From address for email notification
- **fromNumber** `string` — from number for sms notification
- **fromName** `string` — From name for email/sms notification

```json
{
  "receiverType": "user",
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
  "channel": "email",
  "notificationType": "confirmation",
  "isActive": true,
  "deleted": false,
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
  "fromAddress": "[email protected]",
  "fromNumber": "+15551234567",
  "fromName": "Acme Scheduling"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **message** `string` _required_ — Result of delete/update operation

```json
{
  "message": "Notification deleted successfully"
}
```
