---
title: "Location"
source: "https://marketplace.gohighlevel.com/docs/webhook/LocationCreate"
seccion: "Webhook > LocationCreate"
api_version: "v3"
capturado: "2026-08-30"
---

# Location

Called whenever a location is created.

> Available only to Agency Level Apps.

#### Schema

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "stripeProductId": {
      "type": "string"
    },
    "companyId": {
      "type": "string"
    }
  }
}
```

#### Example

```json
{
  "type": "LocationCreate",
  "id": "ve9EPM428h8vShlRW1KT",
  "companyId": "otg8dTQqGLh3Q6iQI55w",
  "name": "Loram ipsum",
  "email": "[email protected]",
  "stripeProductId": "prod_xyz123abc"
}
```
