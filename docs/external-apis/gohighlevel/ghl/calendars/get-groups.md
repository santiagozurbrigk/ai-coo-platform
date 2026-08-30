---
title: "Get Groups"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-groups"
seccion: "Calendars > Calendar Groups > Get Groups"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/groups"
---

# Get Groups

```http
GET /calendars/groups
```

Get all calendar groups in a location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **groups** `object[]` — List of calendar groups

```json
{
  "groups": [
    {
      "locationId": "ocQHyuzHvysMo5N5VsXc",
      "name": "group a",
      "slug": "15-mins"
    }
  ]
}
```
