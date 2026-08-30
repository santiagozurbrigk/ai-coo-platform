---
title: "Update Group"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/edit-group"
seccion: "Calendars > Calendar Groups > Update Group"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/calendars/groups/:groupId"
---

# Update Group

```http
PUT /calendars/groups/:groupId
```

Update Group by group ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **groupId** `string` _required_ — Group Id

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Group name
- **description** `string` _required_ — Group description
- **slug** `string` _required_ — Group slug

```json
{
  "name": "group a",
  "description": "group description",
  "slug": "15-mins"
}
```

### Response (200 · application/json)

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
