---
title: "Get Calendars"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-calendars"
seccion: "Calendars > Calendars > Get Calendars"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/"
---

# Get Calendars

```http
GET /calendars/
```

Get all calendars in a location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id
- **groupId** `string` — Group Id
- **showDrafted** `boolean` — Show drafted

  Default value:

  `true`

### Response (200 · application/json)

Successful response

**Schema**

- **calendars** `object[]` — List of calendars

```json
{
  "calendars": [
    {
      "id": "0TkCdp9PfvLeWKYRRvIz",
      "name": "test calendar",
      "locationId": "ocQHyuzHvysMo5N5VsXc"
    }
  ]
}
```
