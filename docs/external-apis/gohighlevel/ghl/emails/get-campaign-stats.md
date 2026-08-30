---
title: "Get Campaign Statistics"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/get-campaign-stats"
seccion: "Email > Statistics > Get Campaign Statistics"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/campaigns/stats/:source/:sourceId"
---

# Get Campaign Statistics

```http
GET /emails/locations/:locationId/campaigns/stats/:source/:sourceId
```

Get statistics for email campaigns, workflows, or bulk actions

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **source** `string` _required_ — Source type: email-campaigns, workflow-campaigns, or bulk-actions
  - Available options: `email-campaigns`, `workflow-campaigns`, `bulk-actions`
- **sourceId** `string` _required_ — Source ID of the email campaign, workflow campaign, or bulk action

### Query parameters

- **subSourceId** `string` — Workflow action ID. Only valid when source is `workflow-campaigns`

### Response (200 · application/json)

Success

**Schema**

- **locationId** `string` _required_ — Location ID
- **source** `string` _required_ — Source type
  - Available options: `email-campaigns`, `workflow-campaigns`, `bulk-actions`
- **sourceId** `string` _required_ — Source ID
- **subSourceId** `string` — Workflow action ID
- **stats** `object` _required_ — Email performance metrics
- **traceId** `string` — Trace ID of the request

```json
{
  "locationId": "abc123",
  "source": "email-campaigns",
  "sourceId": "campaign123",
  "subSourceId": "step001",
  "stats": {
    "sent": 1020,
    "accepted": 5,
    "delivered": 1000,
    "opened": 450,
    "clicked": 120,
    "unsubscribed": 5,
    "complained": 2,
    "permanentFail": 15,
    "temporaryFail": 3,
    "rejected": 10,
    "failed": 5,
    "replied": 25,
    "openRate": 45,
    "clickRate": 12,
    "unsubscribeRate": 0.5,
    "complaintRate": 0.2,
    "bounceRate": 1.76,
    "replyRate": 2.5
  },
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
