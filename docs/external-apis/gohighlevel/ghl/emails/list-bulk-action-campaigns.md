---
title: "List Bulk Action Campaigns"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/list-bulk-action-campaigns"
seccion: "Email > Campaigns > List Bulk Action Campaigns"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/campaigns/bulk-actions"
---

# List Bulk Action Campaigns

```http
GET /emails/locations/:locationId/campaigns/bulk-actions
```

Get list of bulk action campaigns for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID

### Query parameters

- **limit** `number` — Number of campaigns to return. Defaults to 10, minimum is 1, maximum is 20 **Possible values:** `>= 1` and `<= 20`

  Default value:

  `10`

- **offset** `number` — Number of campaigns to skip for pagination. Defaults to 0, minimum is 0 **Possible values:** `>= 0`

  Default value:

  `0`

- **search** `string` — Search query to filter campaigns.

  Default value:

- **dateFrom** `string` — Filter by start date (ISO 8601 format)
- **dateTo** `string` — Filter by end date (ISO 8601 format)
- **status** `string` — Filter by status
  - Available options: `processing`, `scheduled`, `paused`, `complete`, `cancelled`

### Response (200 · application/json)

Success

**Schema**

- **campaigns** `object[]` _required_ — List of bulk action campaigns
- **total** `number` _required_ — Total count of bulk action campaigns
- **traceId** `string` — Trace ID of the request

```json
{
  "campaigns": [
    {
      "id": "OI72xYec4Mho6VBykTvj",
      "name": "Test Mail",
      "status": "complete",
      "deleted": false,
      "createdAt": "2025-07-24T11:55:43.598Z",
      "updatedAt": "2026-02-09T04:49:12.322Z"
    }
  ],
  "total": 25,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
