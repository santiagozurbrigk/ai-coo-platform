---
title: "Update Calendar"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-calendar"
seccion: "Calendars > Calendars > Update Calendar"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/:calendarId"
---

# Update Calendar

```http
PUT /calendars/:calendarId
```

Update calendar by ID.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **calendarId** `string` _required_ — Calendar Id

### Request body (application/json)

**Body required**

- **notifications** `object[]` — 🚨 Deprecated! Please use 'Calendar Notifications APIs' instead.
- **groupId** `string` — Group Id
- **teamMembers** `object[]` — Team members are required for calendars of type: Round Robin, Collective, Class, Service. Personal calendar must have exactly one team member.
- **eventType** `string` — Event type for round robin distribution
  - Available options: `RoundRobin_OptimizeForAvailability`, `RoundRobin_OptimizeForEqualDistribution`
- **name** `string` — Calendar name
- **description** `string` — Calendar description
- **slug** `string` — Calendar slug for URL
- **widgetSlug** `string` — Widget slug
- **widgetType** `string` — Calendar widget type. Choose "default" for "neo" and "classic" for "classic" layout.
  - Available options: `default`, `classic`
- **eventTitle** `string` — Title for calendar events
- **eventColor** `string` — Color for calendar events in hex format

  **Default value:**

  `#039be5`

- **locationConfigurations** `object[]` — Meeting location configuration for event calendar
- **slotDuration** `number` — This controls the duration of the meeting

  **Default value:**

  `30`

- **slotDurationUnit** `string` — Unit for slot duration.
  - Available options: `mins`, `hours`
- **preBufferUnit** `string` — Unit for pre-buffer.
  - Available options: `mins`, `hours`
- **slotInterval** `number` — Slot interval reflects the amount of time the between booking slots that will be shown in the calendar.

  **Default value:**

  `30`

- **slotIntervalUnit** `string` — Unit for slot interval.
  - Available options: `mins`, `hours`
- **slotBuffer** `number` — Slot-Buffer is additional time that can be added after an appointment, allowing for extra time to wrap up
- **preBuffer** `number` — Pre-Buffer is additional time that can be added before an appointment, allowing for extra time to get ready
- **appoinmentPerSlot** `number` — Deprecated: use appointmentPerSlot instead. Maximum bookings per slot (per user)
- **appoinmentPerDay** `number` — Number of appointments that can be booked for a given day
- **allowBookingAfter** `number` — Minimum scheduling notice for events
- **allowBookingAfterUnit** `string` — Unit for minimum scheduling notice
  - Available options: `hours`, `days`, `weeks`, `months`, `mins`
- **allowBookingFor** `number` — Minimum number of days/weeks/months for which to allow booking events
- **allowBookingForUnit** `string` — Unit for controlling the duration for which booking would be allowed for
  - Available options: `days`, `weeks`, `months`
- **openHours** `object[]` — While we will support this property for backward compatibility, it is recommended to use 'Availability' APIs instead.
- **enableRecurring** `boolean` — Enable recurring appointments for the calendars. Please note that only one member should be added in the calendar to enable this

  **Default value:**

  `false`

- **recurring** `object` — Recurring appointment configuration
- **formId** `string` — Form ID to be used for booking
- **stickyContact** `boolean` — Enable sticky contact assignment
- **isLivePaymentMode** `boolean` — Whether payment mode is live
- **autoConfirm** `boolean` — Auto-confirm appointments
- **shouldSendAlertEmailsToAssignedMember** `boolean` — Send alert emails to assigned team member
- **alertEmail** `string` — Alert email address
- **googleInvitationEmails** `boolean` — Send Google invitation emails
- **allowReschedule** `boolean` — Allow rescheduling of appointments
- **allowCancellation** `boolean` — Allow cancellation of appointments
- **shouldAssignContactToTeamMember** `boolean` — Assign contact to team member on booking
- **shouldSkipAssigningContactForExisting** `boolean` — Skip assigning contact if contact already exists
- **notes** `string` — Notes for the calendar
- **pixelId** `string` — Facebook Pixel ID for tracking
- **formSubmitType** `string` — Action after form submission
  - Available options: `RedirectURL`, `ThankYouMessage`
- **formSubmitRedirectURL** `string` — Redirect URL after form submission
- **formSubmitThanksMessage** `string` — Thank you message displayed after form submission
- **availabilityType** `number` — While we will support this property for backward compatibility, it is not required anymore.
  - Available options: `0`, `1`
- **availabilities** `object[]` — While we will support this property for backward compatibility, it is recommended to use 'Availability' APIs instead.
- **guestType** `string` — Type of guest allowed
  - Available options: `count_only`, `collect_detail`
- **consentLabel** `string` — Consent label text
- **calendarCoverImage** `string` — Calendar cover image URL
- **lookBusyConfig** `object` — Look Busy Configuration
- **isActive** `boolean` — Whether the calendar is active
- **appointmentPerSlot** `number` — Maximum bookings per slot (per user)
- **appointmentPerDay** `number` — Number of appointments that can be booked for a given day

```json
{
  "groupId": "BqTwX8QFwXzpegMve9EQ",
  "teamMembers": [
    {
      "userId": "ocQHyuzHvysMo5N5VsXc",
      "priority": 0.5,
      "isPrimary": true
    }
  ],
  "eventType": "RoundRobin_OptimizeForAvailability",
  "name": "test calendar",
  "description": "this is used for testing",
  "slug": "test1",
  "widgetSlug": "test1",
  "widgetType": "classic",
  "eventTitle": "{{contact.name}}",
  "eventColor": "#039BE5",
  "locationConfigurations": [
    {
      "kind": "custom",
      "location": "https://meet.google.com/abc-def"
    }
  ],
  "slotDuration": 30,
  "slotDurationUnit": "mins",
  "preBufferUnit": "mins",
  "slotInterval": 30,
  "slotIntervalUnit": "mins",
  "slotBuffer": 15,
  "preBuffer": 10,
  "appoinmentPerSlot": 1,
  "appoinmentPerDay": 8,
  "allowBookingAfter": 4,
  "allowBookingAfterUnit": "days",
  "allowBookingFor": 30,
  "allowBookingForUnit": "days",
  "enableRecurring": false,
  "recurring": {
    "freq": "WEEKLY",
    "count": 4,
    "bookingOption": "skip",
    "bookingOverlapDefaultStatus": "confirmed"
  },
  "formId": "YlWd2wuCAZQzh2cH1fVZ",
  "stickyContact": true,
  "isLivePaymentMode": false,
  "autoConfirm": true,
  "shouldSendAlertEmailsToAssignedMember": false,
  "alertEmail": "[email protected]",
  "googleInvitationEmails": true,
  "allowReschedule": true,
  "allowCancellation": true,
  "shouldAssignContactToTeamMember": true,
  "shouldSkipAssigningContactForExisting": false,
  "notes": "Please arrive 10 minutes early.",
  "pixelId": "1234567890",
  "formSubmitType": "ThankYouMessage",
  "formSubmitRedirectURL": "https://example.com/thank-you",
  "formSubmitThanksMessage": "Thank you for booking!",
  "guestType": "count_only",
  "consentLabel": "I confirm that I want to receive content from this company using any contact information I provide.",
  "calendarCoverImage": "https://path-to-image.com",
  "lookBusyConfig": {
    "enabled": true,
    "lookBusyPercentage": 50
  },
  "isActive": true,
  "appointmentPerSlot": 1,
  "appointmentPerDay": 8
}
```

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
