---
title: "Get Service Locations"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-service-locations"
seccion: "Calendars > Service Locations > Get Service Locations"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/services/locations"
---

# Get Service Locations

```http
GET /calendars/services/locations
```

Get all service locations

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID

### Response (200 · application/json)

Successful response

**Schema**

- **serviceLocations** `object[]` _required_ — List of service locations

```json
{
  "serviceLocations": [
    {
      "id": "65e5f6dfacf123513228d384",
      "locationId": "0007BWpSzSwfiuSl0tR2",
      "name": "Main Office"
    }
  ]
}
```
