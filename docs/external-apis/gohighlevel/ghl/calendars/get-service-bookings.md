---
title: "Get Service Bookings"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-service-bookings"
seccion: "Calendars > Service Bookings > Get Service Bookings"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/services/bookings"
---

# Get Service Bookings

```http
GET /calendars/services/bookings
```

Retrieve service bookings for a location within a given date range, with an optional service location filter.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID
- **startTime** `string` _required_ — Start Time (timestamp in milliseconds as string)
- **endTime** `string` _required_ — End Time (timestamp in milliseconds as string)
- **timezone** `string` — Timezone
- **serviceLocationId** `string` — Service Location ID

### Response (200 · application/json)

Successful response

**Schema**

- **bookings** `object[]` _required_ — Service Bookings

```json
{
  "bookings": [
    {
      "bookingId": "7NkT25Vor1v4aQatFsv2",
      "locationId": "0007BWpSzSwfiuSl0tR2",
      "contactId": "9NkT25Vor1v4aQatFsv2",
      "serviceLocationId": "65e5f6dfacf123513228d384",
      "title": "John Doe - Hair Styling",
      "startTime": "2023-09-25T16:00:00+05:30",
      "endTime": "2023-09-25T16:30:00+05:30",
      "timezone": "America/New_York",
      "status": "confirmed",
      "deleted": false
    }
  ]
}
```
