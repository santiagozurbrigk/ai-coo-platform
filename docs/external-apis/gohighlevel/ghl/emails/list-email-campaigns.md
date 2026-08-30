---
title: "List Email Campaigns"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/list-email-campaigns"
seccion: "Email > Campaigns > List Email Campaigns"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/campaigns/emails"
---

# List Email Campaigns

```http
GET /emails/locations/:locationId/campaigns/emails
```

Get list of email campaigns for a location

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

- **search** `string` — Search text for campaign name
- **status** `string` — Filter by campaign status
  - Available options: `all`, `sent`, `failed`, `archived`, `draft`, `processing`, `scheduled`, `cancelled`, `paused`

### Response (200 · application/json)

Success

**Schema**

- **campaigns** `object[]` _required_ — List of email campaigns
- **total** `number` _required_ — Total count of email campaigns
- **traceId** `string` — Trace ID of the request

```json
{
  "campaigns": [
    {
      "id": "67f15c2ae99226d5bcccb8f3",
      "name": "February Newsletter",
      "status": "sent",
      "deleted": false,
      "createdAt": "2025-07-24T11:55:43.598Z",
      "updatedAt": "2026-02-09T04:49:12.322Z"
    }
  ],
  "total": 25,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
