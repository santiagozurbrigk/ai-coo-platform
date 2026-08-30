---
title: "Create a new FAQ inside knowledge base"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/create"
seccion: "Knowledge Base > Faqs > Create a new FAQ inside knowledge base"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/knowledge-bases/faqs"
---

# Create a new FAQ inside knowledge base

```http
POST /knowledge-bases/faqs
```

Creates a new question-and-answer entry in a knowledge base. WHEN TO USE: use this when you need to add a brand-new FAQ; use update to change an existing one; use list to see current FAQs. RETURNS: success and the created FAQ, including its server-assigned id.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — location ID as string
- **question** `string` _required_ — faq question as a string
- **answer** `string` _required_ — faq answer as a string
- **knowledgeBaseId** `string` _required_ — knowledge base ID as string

```json
{
  "locationId": "HqDZpF8GH3qvgJTmKCoL",
  "question": "What is the capital of France?",
  "answer": "The capital of France is Paris.",
  "knowledgeBaseId": "710KoEzy793Fxubft0bc"
}
```

### Response (201 · application/json)

FAQ created successfully

**Schema**

- **success** `boolean` _required_ — Success status of the operation
- **faq** `object` _required_ — Created FAQ details

```json
{
  "success": true,
  "faq": {}
}
```
