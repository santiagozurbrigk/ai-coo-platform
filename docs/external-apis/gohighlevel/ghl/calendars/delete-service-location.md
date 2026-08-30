---
title: "Delete Service Location"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-service-location"
seccion: "Calendars > Service Locations > Delete Service Location"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/services/locations/:serviceLocationId"
---

# Delete Service Location

```http
DELETE /calendars/services/locations/:serviceLocationId
```

Delete a service location by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **serviceLocationId** `string` _required_ — Unique Service Location ID

### Response (200 · application/json)

Service location deleted successfully

**Schema**

- **success** `boolean` _required_ — Success
- **message** `string` — Success message

```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```
