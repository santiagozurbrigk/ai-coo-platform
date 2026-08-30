---
title: "Delete Service"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-service-catalog"
seccion: "Calendars > Services > Delete Service"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/services/catalog/:serviceId"
---

# Delete Service

```http
DELETE /calendars/services/catalog/:serviceId
```

Delete service by ID.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **serviceId** `string` _required_ — Service ID

### Response (200 · application/json)

Service deleted successfully

**Schema**

- **success** `boolean` _required_ — Success
- **message** `string` — Success message

```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```
