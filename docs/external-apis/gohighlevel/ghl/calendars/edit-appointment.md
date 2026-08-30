---
title: "Update Appointment"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/edit-appointment"
seccion: "Calendars > Calendar Events > Update Appointment"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/events/appointments/:eventId"
---

# Update Appointment

```http
PUT /calendars/events/appointments/:eventId
```

Update appointment

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **eventId** `string` _required_ — Event Id or Instance id. For recurring appointments send masterEventId to modify original series.

### Request body (application/json)

**Body required**

- **title** `string` — Title
- **meetingLocationType** `string` — Meeting location type.
  - Available options: `custom`, `zoom`, `gmeet`, `phone`, `address`, `ms_teams`, `google`
  - If `address` is provided in the request body, the `meetingLocationType` defaults to **custom**.
- **meetingLocationId** `string` — The unique identifier for the meeting location.
  - This value can be found in `calendar.locationConfigurations`or `calendar.teamMembers[].locationConfigurations`

  **Default value:**

  `default`

- **overrideLocationConfig** `boolean` — Flag to override location config
  - **false** - If only `meetingLocationId` is provided
  - **true** - If only `meetingLocationType` is provided
- **appointmentStatus** `string` — Appointment status
  - Available options: `new`, `confirmed`, `cancelled`, `showed`, `noshow`, `invalid`, `completed`, `active`
- **assignedUserId** `string` — Assigned User Id
- **description** `string` — Appointment Description
- **address** `string` — Appointment Address
- **ignoreDateRange** `boolean` — If set to true, the minimum scheduling notice and date range would be ignored
- **toNotify** `boolean` — If set to false, the automations will not run. Defaults to true

  **Default value:**

  `true`

- **ignoreFreeSlotValidation** `boolean` — If true the time slot validation would be avoided for any appointment creation (even the ignoreDateRange)
- **rrule** `string` — RRULE as per the iCalendar (RFC 5545) specification for recurring events. DTSTART is not required, instance ids are calculated on the basis of startTime of the event. The rrule only be applied if ignoreFreeSlotValidation is true.
- **calendarId** `string` — Calendar Id
- **startTime** `string` — Start Time
- **endTime** `string` — End Time

```json
{
  "title": "Test Event",
  "meetingLocationType": "custom",
  "meetingLocationId": "custom_0",
  "overrideLocationConfig": true,
  "appointmentStatus": "confirmed",
  "assignedUserId": "0007BWpSzSwfiuSl0tR2",
  "description": "Booking a call to discuss the project",
  "address": "Zoom",
  "ignoreDateRange": false,
  "toNotify": false,
  "ignoreFreeSlotValidation": true,
  "rrule": "RRULE:FREQ=DAILY;INTERVAL=1;COUNT=5",
  "calendarId": "CVokAlI8fgw4WYWoCtQz",
  "startTime": "2021-06-23T03:30:00+05:30",
  "endTime": "2021-06-23T04:30:00+05:30"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **calendarId** `string` _required_ — Calendar Id
- **locationId** `string` _required_ — Location Id
- **contactId** `string` _required_ — Contact Id
- **startTime** `string` — Start Time
- **endTime** `string` — End Time
- **title** `string` — Title
- **meetingLocationType** `string` — Meeting Location Type

  **Default value:**

  `default`

- **appointmentStatus** `string` — Appointment status
  - Available options: `new`, `confirmed`, `cancelled`, `showed`, `noshow`, `invalid`, `active`, `completed`
- **assignedUserId** `string` — Assigned User Id
- **address** `string` — Appointment Address
- **isRecurring** `boolean` — true if the event is recurring otherwise false
- **rrule** `string` — RRULE as per the iCalendar (RFC 5545) specification for recurring events
- **dateAdded** `string` _required_ — Date Added
- **dateUpdated** `string` _required_ — Date Updated
- **id** `string` _required_ — Id

```json
{
  "calendarId": "CVokAlI8fgw4WYWoCtQz",
  "locationId": "C2QujeCh8ZnC7al2InWR",
  "contactId": "0007BWpSzSwfiuSl0tR2",
  "startTime": "2021-06-23T03:30:00+05:30",
  "endTime": "2021-06-23T04:30:00+05:30",
  "title": "Test Event",
  "meetingLocationType": "custom",
  "appointmentStatus": "confirmed",
  "assignedUserId": "0007BWpSzSwfiuSl0tR2",
  "address": "Zoom",
  "isRecurring": "true",
  "rrule": "RRULE:FREQ=DAILY;INTERVAL=1;COUNT=5",
  "dateAdded": "2021-06-23T03:30:00+05:30",
  "dateUpdated": "2021-06-23T04:30:00+05:30",
  "id": "0TkCdp9PfvLeWKYRRvIz"
}
```
