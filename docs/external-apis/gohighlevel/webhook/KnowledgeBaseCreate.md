---
title: "Knowledge Base"
source: "https://marketplace.gohighlevel.com/docs/webhook/KnowledgeBaseCreate"
seccion: "Webhook > KnowledgeBaseCreate"
api_version: "v3"
capturado: "2026-08-30"
---

# Knowledge Base

Called whenever a knowledge base is created

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
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "deleted": {
      "type": "boolean"
    }
  }
}
```

#### Example

```json
{
  "type": "KnowledgeBaseCreate",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "id": "6578278e879ad2646715ba9c",
  "name": "Support Knowledge Base",
  "description": "FAQs and docs for customer support",
  "deleted": false
}
```
