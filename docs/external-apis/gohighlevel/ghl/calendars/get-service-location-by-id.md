---
title: "Get Service Location by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-service-location-by-id"
seccion: "Calendars > Service Locations > Get Service Location by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/services/locations/:serviceLocationId"
---

# Get Service Location by ID

```http
GET /calendars/services/locations/:serviceLocationId
```

Get service location by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **serviceLocationId** `string` _required_ — Unique Service Location ID

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` _required_ — Service Location ID
- **locationId** `string` _required_ — Location ID
- **name** `string` _required_ — Location name
- **slug** `string` _required_ — Unique URL-friendly identifier for the service location
- **isActive** `boolean` — Whether location is active

  **Default value:**

  `true`

- **isPrivate** `boolean` — Whether location is private (not shown publicly)

  **Default value:**

  `false`

- **coverImage** `string` — URL of the cover image displayed for this location
- **locationType** `string` — Location type
  - Available options: `offline`, `ask_booker`
- **address** `string` — Use a full street address when locationType is offline. Use a user-facing label when locationType is ask_booker.
- **phone** `string` — Contact phone number for the service location

```json
{
  "id": "65e5f6dfacf123513228d384",
  "locationId": "0007BWpSzSwfiuSl0tR2",
  "name": "Downtown Wellness Center",
  "slug": "downtown-wellness-center",
  "isActive": true,
  "isPrivate": false,
  "coverImage": "https://storage.example.com/locations/downtown-wellness-center/cover.jpg",
  "locationType": "offline",
  "address": "456 Market Street, Suite 200, San Francisco, CA 94105",
  "phone": "+1-415-555-0198"
}
```
