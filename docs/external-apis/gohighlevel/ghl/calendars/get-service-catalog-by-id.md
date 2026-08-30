---
title: "Get Service by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/calendars/get-service-catalog-by-id"
seccion: "Calendars > Services > Get Service by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/calendars/services/catalog/:serviceId"
---

# Get Service by ID

```http
GET /calendars/services/catalog/:serviceId
```

Get service by ID.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **serviceId** `string` _required_ — Service ID

### Response (200 · application/json)

Successful response

**Schema**

- **service** `object` _required_ — Service details

```json
{
  "service": {
    "id": "65e5f6dfacf123513228d384",
    "locationId": "0007BWpSzSwfiuSl0tR2",
    "name": "Hair Styling"
  }
}
```
