---
title: "List number pools"
source: "https://marketplace.gohighlevel.com/docs/ghl/phone-system/get-number-pool-list"
seccion: "LC Phone > lc-phone > List number pools"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/phone-system/number-pools"
---

# List number pools

```http
GET /phone-system/number-pools
```

Returns number pools for the location. Requires locationId as a query parameter.

## Request

### Query parameters

- **locationId** `string` _required_ — Location ID to scope the number pool list

### Response (200)

List of number pools for the location.
