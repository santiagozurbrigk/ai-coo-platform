---
title: "Create conversation form"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-create-conversation-form"
seccion: "Ad Manager > Facebook Integration > Create conversation form"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/facebook/conversation-forms"
---

# Create conversation form

```http
POST /ad-publishing/facebook/conversation-forms
```

Create a Messenger conversation form. Note the created record is returned in its raw stored form rather than the shape the listing endpoint uses: the identifier comes back as `_id` instead of `id`, and the internal `__v` version key is included.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **name** `string` _required_ — Conversation form name
- **text** `string` _required_ — Welcome message text
- **questions** `object[]` _required_ — Quick-reply questions shown in the welcome message of the conversation form

```json
{
  "locationId": "loc_abc123",
  "name": "Welcome Form",
  "text": "Hi! How can we help?",
  "questions": [
    {
      "question": "How can we help?",
      "response": "Thanks for reaching out! A team member will assist you shortly."
    },
    {
      "question": "I want to learn more",
      "response": "Great! Here is a link to our services."
    }
  ]
}
```

### Response (201 · application/json)

The stored conversation form

**Schema**

- **_id** `string` _required_ — Conversation form id. Note `_id`, not the `id` the listing endpoint returns for the same record.
- **name** `string` _required_ — Form name
- **text** `string` _required_ — Opening message
- **locationId** `string` _required_ — Owning location
- **questions** `object[]` _required_ — Prompt and canned-reply pairs as stored
- **createdAt** `string` _required_ — Creation time, ISO-8601
- **updatedAt** `string` _required_ — Last modification time, ISO-8601
- **__v** `number` — Mongo document version key, leaked by this branch only. Not part of the contract.

```json
{
  "_id": "6a8666ec867e604d24f5a49b",
  "name": "Untitled form 20 Aug 26, 08:00 AM",
  "text": "Hi there! Please let us know how we can help you.",
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "questions": [
    {
      "question": "Your question",
      "response": "Click the link below to view the product page.",
      "_id": "6a831fb01aa9a84ff992aefd"
    }
  ],
  "createdAt": "2026-08-20T02:31:08.055Z",
  "updatedAt": "2026-08-20T02:31:08.055Z",
  "__v": 0
}
```
