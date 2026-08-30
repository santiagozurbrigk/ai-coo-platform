---
title: "Get Service Booking by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-service-booking-by-id"
seccion: "Calendars > Service Bookings > Get Service Booking by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/services/bookings/:bookingId"
---

# Get Service Booking by ID

```http
GET /calendars/services/bookings/:bookingId
```

Get a specific service booking by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **bookingId** `string` _required_ — Unique Service Booking ID

### Response (200 · application/json)

Successful response

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
  "meetingLocation": "123 Main St, Anytown, USA"
}
```
