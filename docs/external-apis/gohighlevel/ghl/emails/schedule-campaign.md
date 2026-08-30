---
title: "Schedule Campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/schedule-campaign"
seccion: "Email > Campaigns > Schedule Campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/emails/locations/:locationId/campaigns/emails/:campaignId/schedule"
---

# Schedule Campaign

```http
POST /emails/locations/:locationId/campaigns/emails/:campaignId/schedule
```

Schedule or start an email campaign. The campaign must be in draft, cancelled, or paused status.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **campaignId** `string` _required_ — Campaign ID

### Request body (application/json)

**Body required**

- **scheduleType** `string` _required_ — How to schedule the campaign
  - Available options: `immediate`, `scheduled`, `batch`, `rss`, `smart_send`
- **timeZone** `string` _required_ — IANA timezone
- **userId** `string` _required_ — ID of the user performing this action
- **userName** `string` — Name of the user performing this action
- **emailMeta** `object` _required_ — Email subject, sender, and content metadata
- **recipients** `object` _required_ — Who receives the email. Must provide either contactIds or filter.
- **sendDays** `string[]` — Days of the week to allow sending. Used for batch and RSS scheduleTypes.
  - Available options: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`
- **scheduleConfig** `object` — Schedule configuration for immediate, scheduled, batch, and smart_send types. Required when scheduleType is not rss.
- **rssConfig** `object` — RSS feed configuration. Required when scheduleType is rss.
- **abTestConfig** `object` — A/B test configuration. Can be combined with any scheduleType except rss.

```json
{
  "scheduleType": "immediate",
  "timeZone": "America/New_York",
  "userId": "507f1f77bcf86cd799439099",
  "userName": "John Doe",
  "emailMeta": {
    "subject": "Our February Newsletter",
    "fromName": "John Doe",
    "fromEmail": "[email protected]"
  },
  "recipients": {
    "type": "contact",
    "contactIds": [
      "contactId1",
      "contactId2"
    ]
  },
  "sendDays": [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
  ],
  "scheduleConfig": {
    "sendAt": "2026-04-01 09:00 AM"
  },
  "rssConfig": {
    "name": "Weekly Digest",
    "rssFeedURL": "https://example.com/rss",
    "repeatAfter": "every_day",
    "repeatAfterTime": "09:00 AM"
  },
  "abTestConfig": {
    "testType": "subjectLine",
    "testDuration": 3600,
    "variationCount": 2,
    "testSize": 30,
    "winningCriteria": "openRate",
    "variations": [
      {
        "subject": "Subject A"
      },
      {
        "subject": "Subject B"
      }
    ]
  }
}
```

### Response (201 · application/json)

Success

**Schema**

- **campaignId** `string` _required_ — Campaign ID
- **sourceId** `string` _required_ — Source ID for fetching campaign statistics
- **traceId** `string` — Trace ID of the request

```json
{
  "campaignId": "67f15c2ae99226d5bcccb8f3",
  "sourceId": "B67vyPIAfq3Bnk3FVioE",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
