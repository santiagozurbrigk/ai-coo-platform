---
title: "Delete Service Booking"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-service-booking"
seccion: "Calendars > Service Bookings > Delete Service Booking"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/services/bookings/:bookingId"
---

# Delete Service Booking

```http
DELETE /calendars/services/bookings/:bookingId
```

Delete a service booking by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **bookingId** `string` _required_ — Unique Service Booking ID

### Response (200 · application/json)

Booking deleted successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the deletion was successful
- **message** `string` _required_ — Response message

```json
{
  "success": true,
  "message": "Service booking deleted successfully"
}
```
