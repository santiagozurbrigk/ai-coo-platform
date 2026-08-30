---
title: "Batch update audience members"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-batch-update-audience-members"
seccion: "Ad Manager > Facebook Ads > Batch update audience members"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/ad-publishing/facebook/custom-audience/:audienceId/member/batch"
---

# Batch update audience members

```http
PUT /ad-publishing/facebook/custom-audience/:audienceId/member/batch
```

Add or remove members in bulk from a Facebook custom audience, sourced from a CSV or one or more smart lists — at least one of `csvPath` or `smartlistIds` is required. The work is queued rather than performed inline, so the acknowledgement confirms only that the job was accepted; nothing about the outcome is reported here. Unlike the single-member endpoints this one answers with `{ success: true }` rather than a status-and-message body.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **audienceId** `string` _required_ — Custom audience identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **csvPath** `string` — CSV file path
- **operationType** `string` _required_ — Batch operation type
  - Available options: `ADD`, `REMOVE`, `REPLACE`
- **smartlistIds** `string[]` — Smartlist IDs array
- **dynamicAudience** `string` — Dynamic audience flag

```json
{
  "locationId": "loc_abc123",
  "csvPath": "/uploads/audience.csv",
  "operationType": "ADD",
  "smartlistIds": [
    "list_1",
    "list_2"
  ],
  "dynamicAudience": "true"
}
```

### Response (200 · application/json)

Acknowledgement that the bulk update was queued

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
