---
title: "Validate group slug"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/validate-groups-slug"
seccion: "Calendars > Calendar Groups > Validate group slug"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/calendars/groups/validate-slug"
---

# Validate group slug

```http
POST /calendars/groups/validate-slug
```

Validate if group slug is available or not.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location Id
- **slug** `string` _required_ — Slug

```json
{
  "locationId": "ve9EPM428h8vShlRW1KT",
  "slug": "calendar-1"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **available** `boolean` _required_ — Whether the slug is available

```json
{
  "available": true
}
```
