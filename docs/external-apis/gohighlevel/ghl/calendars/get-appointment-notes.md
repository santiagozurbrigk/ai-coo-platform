---
title: "Get Notes"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-appointment-notes"
seccion: "Calendars > Appointment Notes > Get Notes"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/appointments/:appointmentId/notes"
---

# Get Notes

```http
GET /calendars/appointments/:appointmentId/notes
```

Get Appointment Notes

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **appointmentId** `string` _required_ — Appointment ID

### Query parameters

- **limit** `number` _required_ — Limit of notes to fetch **Possible values:** `<= 20`
- **offset** `number` _required_ — Offset of notes to fetch **Possible values:** `>= 0`

### Response (200 · application/json)

Successful response

**Schema**

- **notes** `object[]` — List of appointment notes
- **hasMore** `boolean` — Whether more notes are available

```json
{
  "notes": [
    {
      "id": "HGPcayliwcdoUFzvbTok",
      "body": "lorem ipsum",
      "userId": "TUcmRxWrjqzJS8EjkxNK"
    }
  ],
  "hasMore": true
}
```
