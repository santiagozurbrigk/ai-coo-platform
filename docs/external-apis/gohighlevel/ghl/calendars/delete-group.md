---
title: "Delete Group"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/delete-group"
seccion: "Calendars > Calendar Groups > Delete Group"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/calendars/groups/:groupId"
---

# Delete Group

```http
DELETE /calendars/groups/:groupId
```

Delete Group

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **groupId** `string` _required_ — Group Id

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` — Success

```json
{
  "success": "true"
}
```
