---
title: "Download transcription by Message ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/download-message-transcription"
seccion: "Conversations > Messages > Download transcription by Message ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversations/locations/:locationId/messages/:messageId/transcription/download"
---

# Download transcription by Message ID

```http
GET /conversations/locations/:locationId/messages/:messageId/transcription/download
```

Download the recording transcription for a message by passing the message id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID as string
- **messageId** `string` _required_ — Message ID as string

### Response (200)

Downloads the attached transcription of the message

- **Content-Type** — text/plain
- **Content-Disposition** — Attachment; filename="transcription.txt"
