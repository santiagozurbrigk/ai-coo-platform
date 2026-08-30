---
title: "Train discovered website pages and ingest into the knowledge base"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/train-discovered-urls"
seccion: "Knowledge Base > Web Crawler > Train discovered website pages and ingest into the knowledge base"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/knowledge-bases/crawler/train"
---

# Train discovered website pages and ingest into the knowledge base

```http
POST /knowledge-bases/crawler/train
```

Queues selected discovered pages so the AI ingests their content into the knowledge base. WHEN TO USE: use this when discoverWebsite has already found pages; use discoverWebsite to crawl first; use deleteTrainedUrlsForKnowledgeBase to untrain pages. RETURNS: whether training was queued, a status message, and the URL ids that were accepted.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID as string
- **knowledgeBaseId** `string` _required_ — Knowledge base ID as string
- **operationId** `string` _required_ — Operation ID as string
- **urlIds** `string[]` _required_ — List of URL IDs to train

```json
{
  "locationId": "jNtgzTfHnLKErAWswvVE",
  "knowledgeBaseId": "RXzAdYGknD2phAoln3Jl",
  "operationId": "689267ba9d8d63ea160ee9c7",
  "urlIds": [
    "689267ccb27254d92da17b69"
  ]
}
```

### Response (201 · application/json)

Pages trained successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the operation was successful
- **message** `string` _required_ — Success message
- **urlIds** `string[]` _required_ — Array of URL IDs that were queued for training

```json
{
  "success": true,
  "message": "Training queued for 3 URLs",
  "urlIds": [
    "url_123",
    "url_456",
    "url_789"
  ]
}
```
