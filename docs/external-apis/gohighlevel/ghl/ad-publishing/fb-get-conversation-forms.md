---
title: "Get conversation forms"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-conversation-forms"
seccion: "Ad Manager > Facebook Integration > Get conversation forms"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/conversation-forms"
---

# Get conversation forms

```http
GET /ad-publishing/facebook/conversation-forms
```

Retrieve Facebook conversation lead forms for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100) the response is a paginated `{ conversationForms, paging }` envelope; pass `after` (from `paging.next`) to fetch the next batch.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **limit** `string` — Page size for a paginated fetch (max 100). When set, the response is a { conversationForms, paging } envelope instead of a plain array.
- **after** `string` — Opaque cursor for the next batch, taken from the previous response paging.next

### Response (200 · application/json)

A plain array of conversation forms (default), or a { conversationForms, paging } envelope when `limit` is provided. Sorted newest first in both cases.

**Schema**

oneOf

Array [

- **id** `string` _required_ — Conversation form id
- **name** `string` _required_ — Form name
- **text** `string` _required_ — Opening message shown when the conversation starts
- **locationId** `string` _required_ — Owning location
- **questions** `object[]` _required_ — Prompt and canned-reply pairs
- **createdAt** `string` _required_ — Creation time, ISO-8601
- **updatedAt** `string` _required_ — Last modification time, ISO-8601

]

```json
[
  {
    "id": "6a831fb01aa9a84ff992aefc",
    "name": "Untitled form 17 Aug 26, 08:20 PM",
    "text": "Hi there! Please let us know how we can help you.",
    "locationId": "fRMewNQIxSyZ5R4nQyit",
    "questions": [
      {
        "question": "Your question",
        "response": "Click the link below to view the product page.",
        "_id": "6a831fb01aa9a84ff992aefd"
      }
    ],
    "createdAt": "2026-08-17T14:50:24.444Z",
    "updatedAt": "2026-08-17T14:50:24.444Z"
  }
]
```
