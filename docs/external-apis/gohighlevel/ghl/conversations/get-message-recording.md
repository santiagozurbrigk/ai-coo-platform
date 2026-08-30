---
title: "Get Recording by Message ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/get-message-recording"
seccion: "Conversations > Messages > Get Recording by Message ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversations/messages/:messageId/locations/:locationId/recording"
---

# Get Recording by Message ID

```http
GET /conversations/messages/:messageId/locations/:locationId/recording
```

Get the recording for a message by passing the message id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID as string
- **messageId** `string` _required_ — Message ID as string

### Response (200)

Gives the attached recording to the message

- **Content-Type** — audio/x-wav
- **Content-Disposition** — Attachment; filename=audio.wav
