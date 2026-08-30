---
title: "List Calendar Resources"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/fetch-calendar-resources"
seccion: "Calendars > Calendar Resources: Rooms & Equipments > List Calendar Resources"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/resources/:resourceType"
---

# List Calendar Resources

```http
GET /calendars/resources/:resourceType
```

> deprecated
>
> This endpoint has been deprecated and may be replaced or removed in future versions of the API.
>

List calendar resources by resource type and location ID (Services V1)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **resourceType** `string` _required_ — Calendar Resource Type
  - Available options: `equipments`, `rooms`

### Query parameters

- **locationId** `string` _required_ — Location ID
- **limit** `number` _required_ — Maximum number of results
- **skip** `number` _required_ — Number of results to skip

### Response (200 · application/json)

Calendar resources listed

**Schema**

  Array [

  ]

```json
[
  {
    "locationId": "ocQHyuzHvysMo5N5VsXc",
    "name": "yoga room",
    "resourceType": "rooms",
    "isActive": true,
    "description": "Spacious yoga studio",
    "quantity": 3,
    "outOfService": 0,
    "capacity": 85,
    "calendarIds": [
      "Jsj0xnlDDjw0SuvX1J13",
      "oCM5feFC86FAAbcO7lJK"
    ]
  }
]
```
