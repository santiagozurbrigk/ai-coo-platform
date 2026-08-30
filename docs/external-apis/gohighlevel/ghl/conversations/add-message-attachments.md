---
title: "Add message attachments"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/add-message-attachments"
seccion: "Conversations > Messages > Add message attachments"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/conversations/messages/:messageId/attachments"
---

# Add message attachments

```http
PUT /conversations/messages/:messageId/attachments
```

Set attachments on an existing message (replaces existing). Maximum 5 URLs. Supported for Custom Call message type.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **messageId** `string` _required_ — Message Id

### Request body (application/json)

**Body required**

- **attachments** `string[]` _required_ — Array of attachment URLs to set on the message (replaces existing). Maximum 5 URLs.

```json
{
  "attachments": [
    "https://provider.com/recordings/call-123.mp3"
  ]
}
```

### Response (200 · application/json)

Successfully set message attachments

**Schema**

- **success** `boolean` _required_ — Indicates whether the operation was successful.
- **messageId** `string` _required_ — The ID of the message that was updated.
- **attachments** `string[]` _required_ — The updated list of attachment URLs on the message.

```json
{
  "success": true,
  "messageId": "ve9EPM428h8vShlRW1KT",
  "attachments": [
    "https://provider.com/recordings/call-123.mp3"
  ]
}
```
