---
title: "Create Service Booking"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/create-service-booking"
seccion: "Calendars > Service Bookings > Create Service Booking"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/services/bookings"
---

# Create Service Booking

```http
POST /calendars/services/bookings
```

Create a new service booking

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **overrideAvailability** `boolean` — If true the time slot validation would be avoided for any booking creation/update (even the skipSchedulingNotice)

  Default value:

  `false`

- **skipSchedulingNotice** `boolean` — If set to true, the minimum scheduling notice and date range would be ignored

  Default value:

  `false`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **contactId** `string` _required_ — Contact ID
- **startTime** `string` _required_ — Start Time
- **endTime** `string` _required_ — End Time
- **timezone** `string` _required_ — Timezone
- **services** `object[]` _required_ — Services
- **serviceLocationId** `string` — Service Location ID (If not provided, then the default service location will be used)
- **meetingLocation** `string` — Meeting Location (If service location is an ask the booker, then the meeting location is required)
- **title** `string` — Service Booking Title
- **status** `string` — Status. (If not provided, the status configured in Service Global Settings will be used.)
  - Available options: `confirmed`, `new`

```json
{
  "locationId": "0007BWpSzSwfiuSl0tR2",
  "contactId": "9NkT25Vor1v4aQatFsv2",
  "startTime": "2021-06-23T03:30:00+05:30",
  "endTime": "2023-09-25T16:30:00+05:30",
  "timezone": "America/New_York",
  "services": [
    {
      "id": "a3b4c5d6e7f8901234567890",
      "staffId": "8MkU36Wps2w5bRbuGtw3"
    }
  ],
  "serviceLocationId": "65e5f6dfacf123513228d384",
  "meetingLocation": "123 Main St, Anytown, USA",
  "title": "Service Appointment",
  "status": "confirmed"
}
```

### Response (201 · application/json)

Booking created successfully

**Schema**

- **bookingId** `string` _required_ — Booking ID
- **locationId** `string` _required_ — Location ID
- **contactId** `string` _required_ — Contact ID
- **serviceLocationId** `string` _required_ — Service Location ID
- **title** `string` _required_ — Service Booking Title
- **startTime** `string` _required_ — Start Time
- **endTime** `string` _required_ — End Time
- **services** `object[]` _required_ — Services
- **timezone** `string` _required_ — Timezone
- **status** `string` _required_ — Status
- **deleted** `boolean` _required_ — Tells if the booking is deleted
- **dateAdded** `string` _required_ — Date Added
- **dateUpdated** `string` _required_ — Date Updated
- **createdBy** `object` _required_ — Booking booked by metadata
- **meetingLocation** `string` — Meeting Location (If service location is an ask the booker, then the meeting location is used for the booking)
- **messages** `array[]` — Optional informative or warning messages (e.g. meeting location ignored for non-ask-booker locations)

```json
{
  "bookingId": "7NkT25Vor1v4aQatFsv2",
  "locationId": "0007BWpSzSwfiuSl0tR2",
  "contactId": "9NkT25Vor1v4aQatFsv2",
  "serviceLocationId": "65e5f6dfacf123513228d384",
  "title": "John Doe - Hair Styling",
  "startTime": "2023-09-25T16:00:00+05:30",
  "endTime": "2023-09-25T16:30:00+05:30",
  "services": [
    {
      "id": "68e5f6dfacf123513228d384",
      "serviceCategoryId": "3c4d5e6f7890123456789abc",
      "serviceStaffId": "7NkT25Vor1v4aQatFsv2",
      "serviceStartTime": "2023-09-25T16:00:00+05:30",
      "serviceEndTime": "2023-09-25T16:30:00+05:30"
    }
  ],
  "timezone": "America/New_York",
  "status": "confirmed",
  "deleted": false,
  "dateAdded": "2023-09-25T16:00:00+05:30",
  "dateUpdated": "2023-09-25T16:00:00+05:30",
  "createdBy": {
    "userId": "7NkT25Vor1v4aQatFsv2",
    "source": "public_api"
  },
  "meetingLocation": "123 Main St, Anytown, USA",
  "messages": [
    "Meeting location is not supported for the selected service location and has been ignored."
  ]
}
```
