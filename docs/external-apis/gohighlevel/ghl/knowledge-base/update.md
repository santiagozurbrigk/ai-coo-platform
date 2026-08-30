---
title: "Update an existing knowledge base FAQ"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/update"
seccion: "Knowledge Base > Faqs > Update an existing knowledge base FAQ"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/knowledge-bases/faqs/:id"
---

# Update an existing knowledge base FAQ

```http
PUT /knowledge-bases/faqs/:id
```

Updates the question and/or answer of an existing FAQ. WHEN TO USE: use this when you need to change wording on a FAQ you already have; use create to add a new FAQ; use delete to remove one. RETURNS: whether the update succeeded.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — faq ID as string

### Request body (application/json)

**Body required**

- **question** `string` _required_ — faq question as a string
- **answer** `string` _required_ — faq answer as a string

```json
{
  "question": "What is the capital of France?",
  "answer": "The capital of France is Paris."
}
```

### Response (200 · application/json)

FAQ updated successfully

**Schema**

- **success** `boolean` _required_ — Success status of the update operation

```json
{
  "success": true
}
```
