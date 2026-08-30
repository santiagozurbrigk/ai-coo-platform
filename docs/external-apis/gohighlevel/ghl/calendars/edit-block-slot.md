---
title: "Update Block Slot"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/edit-block-slot"
seccion: "Calendars > Calendar Events > Update Block Slot"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/events/block-slots/:eventId"
---

# Update Block Slot

```http
PUT /calendars/events/block-slots/:eventId
```

Update block slot by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **eventId** `string` _required_ — Event Id or Instance id. For recurring appointments send masterEventId to modify original series.

### Request body (application/json)

**Body required**

- **title** `string` — Title
- **calendarId** `string` _required_ — Either calendarId or assignedUserId can be set, not both.
- **assignedUserId** `string` — Either calendarId or assignedUserId can be set, not both.
- **locationId** `string` _required_ — Location Id
- **startTime** `string` — Start Time
- **endTime** `string` — End Time

```json
{
  "title": "Test Event",
  "calendarId": "CVokAlI8fgw4WYWoCtQz",
  "assignedUserId": "CVokAlI8fgw4WYWoCtQz",
  "locationId": "C2QujeCh8ZnC7al2InWR",
  "startTime": "2021-06-23T03:30:00+05:30",
  "endTime": "2021-06-23T04:30:00+05:30"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **id** `string` _required_ — Id
- **locationId** `string` _required_ — Location Id
- **title** `string` _required_ — Title
- **startTime** `object` _required_ — Start Time
- **endTime** `object` _required_ — End Time
- **calendarId** `string` — Calendar id
- **assignedUserId** `string` — Assigned User Id

```json
{
  "id": "0TkCdp9PfvLeWKYRRvIz",
  "locationId": "C2QujeCh8ZnC7al2InWR",
  "title": "My event",
  "startTime": "2021-06-23T03:30:00+05:30",
  "endTime": "2021-06-23T04:30:00+05:30",
  "calendarId": "CVokAlI8fgw4WYWoCtQz",
  "assignedUserId": "0007BWpSzSwfiuSl0tR2"
}
```
