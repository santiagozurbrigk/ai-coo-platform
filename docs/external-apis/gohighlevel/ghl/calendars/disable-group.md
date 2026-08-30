---
title: "Disable Group"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/disable-group"
seccion: "Calendars > Calendar Groups > Disable Group"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/groups/:groupId/status"
---

# Disable Group

```http
PUT /calendars/groups/:groupId/status
```

Disable Group

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **groupId** `string` _required_ — Group Id

### Request body (application/json)

**Body required**

- **isActive** `boolean` _required_ — Is Active?

```json
{
  "isActive": true
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` — Success

```json
{
  "success": "true"
}
```
