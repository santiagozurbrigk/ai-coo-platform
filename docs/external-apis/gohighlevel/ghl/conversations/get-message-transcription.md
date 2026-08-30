---
title: "Get transcription by Message ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/get-message-transcription"
seccion: "Conversations > Messages > Get transcription by Message ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/conversations/locations/:locationId/messages/:messageId/transcription"
---

# Get transcription by Message ID

```http
GET /conversations/locations/:locationId/messages/:messageId/transcription
```

Get the recording transcription for a message by passing the message id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID as string
- **messageId** `string` _required_ — Message ID as string

### Response (200 · application/json)

Gives the attached recording transcription to the message

**Schema**

- **mediaChannel** `number` _required_ — Media channel describes the user interaction channel
- **sentenceIndex** `number` _required_ — Index of the sentence in the transcription
- **startTime** `number` _required_ — Start time of the sentence in milliseconds
- **endTime** `number` _required_ — End time of the sentence in milliseconds
- **transcript** `string` _required_ — Transcript of the sentence
- **confidence** `number` _required_ — Confidence of the transcription

```json
{
  "mediaChannel": "1",
  "sentenceIndex": "1",
  "startTime": "34",
  "endTime": "45",
  "transcript": "This call may be recorded for quality assurance purposes.",
  "confidence": "0.5"
}
```
