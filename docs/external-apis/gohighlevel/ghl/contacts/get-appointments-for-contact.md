---
title: "Get Appointments for Contact"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-appointments-for-contact"
seccion: "Contacts > Appointments > Get Appointments for Contact"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/:contactId/appointments"
---

# Get Appointments for Contact

```http
GET /contacts/:contactId/appointments
```

Get Appointments for Contact

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Response (200 · application/json)

Successful response

**Schema**

- **events** `object[]` — List of appointments

```json
{
  "events": [
    {
      "id": "YS3jaqqeehkR2Is80miy",
      "calendarId": "YlWd2wuCAZQzh2cH1fVZ",
      "status": "booked",
      "title": "Test",
      "assignedUserId": "YlWd2wuCAZQzh2cH1fVZ",
      "notes": "test",
      "startTime": "2021-07-16 11:00:00",
      "endTime": "2021-07-16 11:30:00"
    }
  ]
}
```
