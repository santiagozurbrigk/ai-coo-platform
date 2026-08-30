---
title: "Create Calendar Group"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/create-calendar-group"
seccion: "Calendars > Calendar Groups > Create Calendar Group"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/groups"
---

# Create Calendar Group

```http
POST /calendars/groups
```

Create Calendar Group

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **name** `string` _required_ — Group name
- **description** `string` _required_ — Group description
- **slug** `string` _required_ — Group slug
- **isActive** `boolean` — Whether the group is active

```json
{
  "locationId": "ocQHyuzHvysMo5N5VsXc",
  "name": "group a",
  "description": "group description",
  "slug": "15-mins",
  "isActive": true
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **group** `object` — The created group object

```json
{
  "group": {
    "locationId": "ocQHyuzHvysMo5N5VsXc",
    "name": "group a",
    "slug": "15-mins"
  }
}
```
