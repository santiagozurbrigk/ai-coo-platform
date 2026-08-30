---
title: "Get all FAQs by knowledge base with pagination support"
source: "https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/list"
seccion: "Knowledge Base > Faqs > Get all FAQs by knowledge base with pagination support"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/knowledge-bases/faqs"
---

# Get all FAQs by knowledge base with pagination support

```http
GET /knowledge-bases/faqs
```

Retrieves Q&A entries for a knowledge base, with cursor or offset pagination and optional question search. WHEN TO USE: use this when you need to list existing FAQs; use create to add one; use update or delete to change or remove a single FAQ. RETURNS: the FAQ list, total count, lastFaqId for the next page, and whether more results exist.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **knowledgeBaseId** `string` _required_ — knowledge base ID as string
- **locationId** `string` _required_ — location ID as string
- **limit** `number` — Limit the number of FAQs returned

  Default value:

  `10`

- **lastFaqId** `string` — Last FAQ ID for pagination (cursor-based)
- **offset** `number` — Number of FAQs to skip (offset-based pagination)

  Default value:

  `0`

- **search** `string` — Search query to filter FAQs by question (case-insensitive contains match)

### Response (200 · application/json)

FAQs retrieved successfully

**Schema**

- **count** `number` _required_ — Total count of all FAQs in the knowledge base
- **faqs** `object[]` _required_ — Array of FAQ objects
- **lastFaqId** `string` — Last FAQ ID for pagination (use as lastFaqId in next request)
- **hasMore** `boolean` — Whether there are more FAQs available

```json
{
  "count": 150,
  "faqs": [
    {
      "id": "3rzeElC1FOVY91veVBkp",
      "question": "What is the capital of France?",
      "answer": "The capital of France is Paris.",
      "knowledgeBaseId": "I1rITlYLJofFosIqC4Np",
      "locationId": "qIyivCmsuEOSnyoFYEej",
      "trainedUrlId": "688e6b6d8a1887e6d94d1475",
      "deleted": false,
      "createdAt": "2025-08-02T19:47:57.243Z",
      "updatedAt": "2025-08-02T19:47:57.243Z"
    }
  ],
  "lastFaqId": "3rzeElC1FOVY91veVBkp",
  "hasMore": true
}
```
