---
title: "Get Calendar Resource"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-calendar-resource"
seccion: "Calendars > Calendar Resources: Rooms & Equipments > Get Calendar Resource"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/resources/:resourceType/:id"
---

# Get Calendar Resource

```http
GET /calendars/resources/:resourceType/:id
```

> deprecated
>
> This endpoint has been deprecated and may be replaced or removed in future versions of the API.
>

Get calendar resource by ID (Services V1)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **resourceType** `string` _required_ — Calendar Resource Type
  - Available options: `equipments`, `rooms`
- **id** `string` _required_ — Calendar Resource ID

### Response (200 · application/json)

Calendar resource fetched

**Schema**

- **locationId** `string` _required_ — Location ID of the resource
- **name** `string` _required_ — Name of the resource
- **resourceType** `string` _required_ — Type of the calendar resource
  - Available options: `equipments`, `rooms`
- **isActive** `boolean` _required_ — Whether the resource is active
- **description** `string` — Description of the resource
- **quantity** `number` — Quantity of the resource
- **outOfService** `number` — Indicates if the resource is out of service
- **capacity** `number` — Capacity of the resource
- **calendarIds** `string[]` _required_ — Calendar IDs

```json
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
```
