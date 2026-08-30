---
title: "Delete Calendar Resource"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-calendar-resource"
seccion: "Calendars > Calendar Resources: Rooms & Equipments > Delete Calendar Resource"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/resources/:resourceType/:id"
---

# Delete Calendar Resource

```http
DELETE /calendars/resources/:resourceType/:id
```

> deprecated
>
> This endpoint has been deprecated and may be replaced or removed in future versions of the API.
>

Delete calendar resource by ID (Services V1)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **resourceType** `string` _required_ — Calendar Resource Type
  - Available options: `equipments`, `rooms`
- **id** `string` _required_ — Calendar Resource ID

### Response (200 · application/json)

Calendar resource deleted

**Schema**

- **success** `boolean` — Success

```json
{
  "success": "true"
}
```
