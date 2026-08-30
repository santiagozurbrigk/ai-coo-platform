---
title: "Delete segment"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-delete-segment"
seccion: "Ad Manager > Google Ads > Delete segment"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/google/segments/:segmentId"
---

# Delete segment

```http
DELETE /ad-publishing/google/segments/:segmentId
```

Delete a Google Ads audience segment by ID

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

Acknowledgement that the segment was removed

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
