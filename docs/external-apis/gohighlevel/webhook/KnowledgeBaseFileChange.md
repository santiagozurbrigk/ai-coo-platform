---
title: "Knowledge Base Asset"
source: "https://marketplace.gohighlevel.com/docs/webhook/KnowledgeBaseFileChange"
seccion: "Webhook > KnowledgeBaseFileChange"
api_version: "v3"
capturado: "2026-08-30"
---

# Knowledge Base Asset

Called whenever a knowledge base **file** asset is created, updated or deleted

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
- Note: `assetType` is always `file` for this event.
- Note: `status` reflects the asset's processing state (for example `uploaded`, `trained` or `failed`) and varies by asset type.

#### Example

```json
{
  "type": "KnowledgeBaseFileChange",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "knowledgeBaseId": "6578278e879ad2646715ba9c",
  "id": "c6tZZU0rJBf30ZXx9Gli",
  "assetType": "file",
  "status": "uploaded",
  "action": "created",
  "deleted": false
}
```
