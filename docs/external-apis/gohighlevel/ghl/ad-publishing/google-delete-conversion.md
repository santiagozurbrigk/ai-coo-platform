---
title: "Delete conversion"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-delete-conversion"
seccion: "Ad Manager > Google Ads > Delete conversion"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/google/conversions/:conversionId"
---

# Delete conversion

```http
DELETE /ad-publishing/google/conversions/:conversionId
```

Delete a Google Ads conversion action by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **conversionId** `string` _required_ — Conversion identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Google Ads mutate results for the removed conversion action — an array, unlike the segment delete

**Schema**

  Array [

  ]

```json
[
  {
    "resourceName": "customers/6776452901/conversionActions/7086809727"
  }
]
```
