---
title: "Get segment by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-segment-by-id"
seccion: "Ad Manager > Google Ads > Get segment by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/segments/:segmentId"
---

# Get segment by ID

```http
GET /ad-publishing/google/segments/:segmentId
```

Retrieve a specific Google Ads audience segment by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **segmentId** `string` _required_ — Segment identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` _required_ — Segment type
  - Available options: `CUSTOM_SEGMENTS`, `DATA_SEGMENTS`

### Response (200 · application/json)

The segment, shaped by the requested `type`. `CUSTOM_SEGMENTS` returns a custom audience with `status` and `members`; `DATA_SEGMENTS` returns a Google user list with rules, sizes, access metadata, and an optional `extras` block holding this product's own record.

**Schema**

oneOf

- **resourceName** `string` _required_ — Google Ads resource name
- **id** `string` _required_ — Segment id
- **status** `string` _required_ — Segment status
- **name** `string` _required_ — Segment name
- **type** `string` _required_ — Google custom-audience type. `AUTO` is the default applied when none is supplied on create.
- **members** `object[]` _required_ — Keywords, URLs and apps that define the segment

```json
{
  "resourceName": "customers/6776452901/customAudiences/874396901",
  "id": "874396901",
  "status": "ENABLED",
  "name": "Running shoe shoppers",
  "type": "AUTO",
  "members": [
    {
      "memberType": "KEYWORD",
      "keyword": "running shoes",
      "url": "www.example.com",
      "app": "app.example.com"
    }
  ]
}
```
