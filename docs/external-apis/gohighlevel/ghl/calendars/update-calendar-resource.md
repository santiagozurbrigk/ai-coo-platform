---
title: "Update Calendar Resource"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/update-calendar-resource"
seccion: "Calendars > Calendar Resources: Rooms & Equipments > Update Calendar Resource"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/resources/:resourceType/:id"
---

# Update Calendar Resource

```http
PUT /calendars/resources/:resourceType/:id
```

> deprecated
>
> This endpoint has been deprecated and may be replaced or removed in future versions of the API.
>

Update calendar resource by ID (Services V1)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **resourceType** `string` _required_ — Calendar Resource Type
  - Available options: `equipments`, `rooms`
- **id** `string` _required_ — Calendar Resource ID

### Request body (application/json)

**Body required**

- **locationId** `string` — Location ID
- **name** `string` — Name of the calendar resource
- **description** `string` — Description of the calendar resource
- **quantity** `number` — Quantity of the equipment.
- **outOfService** `number` — Quantity of the out of service equipment.
- **capacity** `number` — Capacity of the room.
- **calendarIds** `string[]` — Service calendar IDs to be mapped with the resource. One room can be mapped with multiple service calendars. **Possible values:** `<= 100`

  `One equipment can only be mapped with one service calendar.`

- **isActive** `boolean`

```json
{
  "locationId": "ocQHyuzHvysMo5N5VsXc",
  "name": "Projector",
  "description": "Main conference room projector",
  "quantity": 5,
  "outOfService": 1,
  "capacity": 20,
  "calendarIds": [
    "Jsj0xnlDDjw0SuvX1J13"
  ],
  "isActive": true
}
```

### Response (200 · application/json)

Calendar resource updated

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

```json
{
  "locationId": "ocQHyuzHvysMo5N5VsXc",
  "name": "yoga room",
  "resourceType": "rooms",
  "isActive": true,
  "description": "Spacious yoga studio",
  "quantity": 3,
  "outOfService": 0,
  "capacity": 85
}
```
