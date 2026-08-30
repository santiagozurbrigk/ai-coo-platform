---
title: "Get Services"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-services-catalog"
seccion: "Calendars > Services > Get Services"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/services/catalog"
---

# Get Services

```http
GET /calendars/services/catalog
```

Get all services in a location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID
- **serviceCategoryId** `string` — Filter by service category ID
- **isPrivate** `boolean` — Filter services: true = private only, false = public only, unset = all services

### Response (200 · application/json)

Successful response

**Schema**

- **services** `object[]` _required_ — List of services

```json
{
  "services": [
    {
      "id": "65e5f6dfacf123513228d384",
      "locationId": "0007BWpSzSwfiuSl0tR2",
      "name": "Hair Styling"
    }
  ]
}
```
