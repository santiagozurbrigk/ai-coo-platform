---
title: "Create Service Location"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/create-service-location"
seccion: "Calendars > Service Locations > Create Service Location"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/services/locations"
---

# Create Service Location

```http
POST /calendars/services/locations
```

Create a new service location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **name** `string` _required_ — Location name
- **slug** `string` _required_ — URL-friendly slug identifier
- **phone** `string` — Phone number
- **address** `string` — Use a full street address when locationType is offline. Use a user-facing label when locationType is ask_booker.
- **coverImage** `string` — URL of the cover image for this service location
- **locationType** `string` — Location type
  - Available options: `offline`, `ask_booker`

```json
{
  "locationId": "0007BWpSzSwfiuSl0tR2",
  "name": "Midtown Therapy Studio",
  "slug": "midtown-therapy-studio",
  "phone": "+1-212-555-0174",
  "address": "789 5th Avenue, Floor 3, New York, NY 10022 / Home Service",
  "coverImage": "https://storage.example.com/locations/midtown-therapy-studio/cover.jpg",
  "locationType": "offline"
}
```

### Response (201 · application/json)

Service location created successfully

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
