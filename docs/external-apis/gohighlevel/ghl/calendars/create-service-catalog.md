---
title: "Create Service"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/create-service-catalog"
seccion: "Calendars > Services > Create Service"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/services/catalog"
---

# Create Service

```http
POST /calendars/services/catalog
```

Create new service in a location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **name** `string` _required_ — Service name
- **slug** `string` _required_ — Unique URL-friendly identifier
- **staff** `object[]` _required_ — Assigned staff members (at least one required)
- **description** `string` — Service description
- **eventColor** `string` — Service event color (hex)
- **coverImage** `string` — Service cover image URL
- **serviceCategoryId** `string` — Service category ID (uses default category if not provided)
- **payment** `object` — Payment details (default amount is 0, currency configured in Service Global Settings is used.)
- **serviceDuration** `number` — This controls the duration of the appointment
- **serviceDurationUnit** `string` — Duration unit
  - Available options: `mins`, `hours`
- **preBuffer** `number` — Pre-Buffer is additional time that can be added before an appointment, allowing for extra time to get ready
- **preBufferUnit** `string` — Pre-buffer unit
  - Available options: `mins`, `hours`
- **postBuffer** `number` — Post-buffer: Additional time that can be added after an appointment, allowing for extra time to wrap up
- **postBufferUnit** `string` — Post-buffer unit
  - Available options: `mins`, `hours`
- **isPrivate** `boolean` — Whether service is private (not shown publicly)
- **formId** `string` — Custom form ID (will be used to display the custom form on the booking page, if only one service is selected)
- **variations** `object[]` — Service variations (pass empty array for no variations)

```json
{
  "locationId": "0007BWpSzSwfiuSl0tR2",
  "name": "Hair Styling",
  "slug": "hair-styling",
  "staff": [
    {
      "id": "65e5f6dfacf123513228d384"
    }
  ],
  "description": "Full hair styling session",
  "eventColor": "#66C61C",
  "coverImage": "https://example.com/cover.jpg",
  "serviceCategoryId": "65e5f6dfacf123513228d381",
  "payment": {
    "amount": 50,
    "deposit": 20,
    "depositType": "amount"
  },
  "serviceDuration": 30,
  "serviceDurationUnit": "mins",
  "preBuffer": 10,
  "preBufferUnit": "mins",
  "postBuffer": 15,
  "postBufferUnit": "mins",
  "isPrivate": false,
  "formId": "65e5f6dfacf123513228d390",
  "variations": [
    {
      "name": "Standard Haircut",
      "serviceDuration": 30,
      "payment": {
        "amount": 50
      }
    }
  ]
}
```

### Response (201 · application/json)

Service created successfully

**Schema**

- **service** `object` _required_ — Service details

```json
{
  "service": {
    "id": "65e5f6dfacf123513228d384",
    "locationId": "0007BWpSzSwfiuSl0tR2",
    "name": "Hair Styling"
  }
}
```
