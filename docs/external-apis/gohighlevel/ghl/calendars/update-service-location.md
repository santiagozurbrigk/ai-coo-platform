---
title: "Update Service Location"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-service-location"
seccion: "Calendars > Service Locations > Update Service Location"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/services/locations/:serviceLocationId"
---

# Update Service Location

```http
PUT /calendars/services/locations/:serviceLocationId
```

Update an existing service location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **serviceLocationId** `string` _required_ — Unique Service Location ID

### Request body (application/json)

**Body required**

- **name** `string` — Location name
- **slug** `string` — Updated URL-friendly slug identifier
- **phone** `string` — Updated contact phone number
- **address** `string` — Use a full street address when locationType is offline. Use a user-facing label when locationType is ask_booker.
- **coverImage** `string` — Updated URL of the cover image
- **locationType** `string` — Location type
  - Available options: `offline`, `ask_booker`

```json
{
  "name": "California Location",
  "slug": "midtown-wellness-therapy-studio",
  "phone": "+1-212-555-0199",
  "address": "789 5th Avenue, Floor 5, New York, NY 10022",
  "coverImage": "https://storage.example.com/locations/midtown-wellness-studio/cover-v2.jpg",
  "locationType": "offline"
}
```

### Response (200 · application/json)

Service location updated successfully

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
