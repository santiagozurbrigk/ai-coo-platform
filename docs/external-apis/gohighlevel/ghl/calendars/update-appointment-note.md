---
title: "Update Note"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-appointment-note"
seccion: "Calendars > Appointment Notes > Update Note"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/appointments/:appointmentId/notes/:noteId"
---

# Update Note

```http
PUT /calendars/appointments/:appointmentId/notes/:noteId
```

Update Note

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **appointmentId** `string` _required_ — Appointment ID

### Request body (application/json)

**Body required**

- **userId** `string` — User ID of the note author
- **body** `string` _required_ — Note body **Possible values:** `<= 5000 characters`

```json
{
  "userId": "GCs5KuzPqTls7vWclkEV",
  "body": "lorem ipsum"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **note** `object` — The created or updated note

```json
{
  "note": {
    "id": "HGPcayliwcdoUFzvbTok",
    "body": "lorem ipsum",
    "userId": "TUcmRxWrjqzJS8EjkxNK"
  }
}
```
