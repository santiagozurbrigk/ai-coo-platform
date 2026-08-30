---
title: "Knowledge Base Asset"
source: "https://marketplace.gohighlevel.com/docs/webhook/KnowledgeBaseTrainedUrlChange"
seccion: "Webhook > KnowledgeBaseTrainedUrlChange"
api_version: "v3"
capturado: "2026-08-30"
---

# Knowledge Base Asset

Called whenever a knowledge base **trained URL** asset is created, updated or deleted

#### Schema

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "knowledgeBaseId": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "assetType": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "action": {
      "type": "string"
    },
    "deleted": {
      "type": "boolean"
    }
  }
}
```

- Note: `action` indicates the change that occurred and is one of `created`, `updated` or `deleted`. For a `deleted` action, `deleted` is `true`.
- Note: `assetType` is always `trained_url` for this event.
- Note: `status` reflects the crawl/training state of the URL (for example `trained`, `failed` or `aborted`).

#### Example

```json
{
  "type": "KnowledgeBaseTrainedUrlChange",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "knowledgeBaseId": "6578278e879ad2646715ba9c",
  "id": "c6tZZU0rJBf30ZXx9Gli",
  "assetType": "trained_url",
  "status": "trained",
  "action": "created",
  "deleted": false
}
```
