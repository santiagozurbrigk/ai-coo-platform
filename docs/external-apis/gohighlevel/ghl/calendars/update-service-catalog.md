---
title: "Update Service"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-service-catalog"
seccion: "Calendars > Services > Update Service"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/services/catalog/:serviceId"
---

# Update Service

```http
PUT /calendars/services/catalog/:serviceId
```

Update service by ID.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **serviceId** `string` _required_ — Service ID

### Request body (application/json)

**Body required**

- **name** `string` — Service name
- **description** `string` — Service description
- **slug** `string` — Unique URL-friendly identifier
- **eventColor** `string` — Service event color (hex)
- **coverImage** `string` — Service cover image URL
- **serviceCategoryId** `string` — Service category ID
- **payment** `object` — Payment details (currency configured in Service Global Settings is used.)
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
- **staff** `object[]` — Assigned staff members
- **variations** `object[]` — Service variations (an empty array removes all variations). Include an id to update an existing variation; omit the id to create a new one.

```json
{
  "name": "Hair Styling",
  "description": "Full hair styling session",
  "slug": "hair-styling",
  "eventColor": "#66C61C",
  "coverImage": "https://example.com/cover.jpg",
  "serviceCategoryId": "65e5f6dfacf123513228d381",
  "payment": {
    "amount": 50,
    "deposit": 20,
    "depositType": "amount"
  },
  "serviceDuration": 60,
  "serviceDurationUnit": "mins",
  "preBuffer": 10,
  "preBufferUnit": "mins",
  "postBuffer": 15,
  "postBufferUnit": "mins",
  "isPrivate": false,
  "formId": "65e5f6dfacf123513228d390",
  "staff": [
    {
      "id": "65e5f6dfacf123513228d384"
    }
  ],
  "variations": [
    {
      "id": "65e5f6dfacf123513228d385",
      "name": "Standard Haircut",
      "serviceDuration": 30
    }
  ]
}
```

### Response (200 · application/json)

Service updated successfully

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
