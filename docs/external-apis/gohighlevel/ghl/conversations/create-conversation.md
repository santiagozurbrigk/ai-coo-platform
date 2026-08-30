---
title: "Create Conversation"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/create-conversation"
seccion: "Conversations > Conversations > Create Conversation"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversations/"
---

# Create Conversation

```http
POST /conversations/
```

Creates a new conversation with the data provided

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID as string
- **contactId** `string` _required_ — Contact ID as string

```json
{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",
  "contactId": "tDtDnQdgm2LXpyiqYvZ6"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Indicates whether the API request was successful.
- **conversation** `object` _required_ — Conversation data of the provided conversation ID.

```json
{
  "success": true,
  "conversation": {
    "id": "tDtDnQdgm2LXpyiqYvZ6",
    "dateUpdated": "2023-10-01T12:00:00Z",
    "dateAdded": "2023-10-01T12:00:00Z",
    "deleted": false,
    "contactId": "ve9EPM428kjkvShlRW1KT",
    "locationId": "ve9EPM428kjkvShlRW1KT",
    "lastMessageDate": "2023-10-01T12:00:00Z",
    "assignedTo": "ve9EPM428kjkvShlRW1KT"
  }
}
```
