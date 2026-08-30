---
title: "List Workflow Campaigns"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/list-workflow-campaigns"
seccion: "Email > Campaigns > List Workflow Campaigns"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/campaigns/workflows"
---

# List Workflow Campaigns

```http
GET /emails/locations/:locationId/campaigns/workflows
```

Get list of workflow campaigns for a location

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

- **offset** `number` — Number of items to skip for pagination. Defaults to 0, minimum is 0 **Possible values:** `>= 0`

  Default value:

  `0`

- **search** `string` — Search query to filter campaigns.

  Default value:

- **status** `string` — Filter by campaign status
  - Available options: `published`, `draft`

### Response (200 · application/json)

Success

**Schema**

- **campaigns** `object[]` _required_ — List of workflow campaigns
- **total** `number` _required_ — Total count of campaigns
- **traceId** `string` — Trace ID of the request

```json
{
  "campaigns": [
    {
      "id": "693bd14ea6b50a8df0180e9a",
      "name": "sorting workflow",
      "status": "published",
      "createdAt": "2025-12-12T08:24:46.700Z",
      "updatedAt": "2026-01-23T05:58:48.453Z"
    }
  ],
  "total": 50,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
