---
title: "Get Conversation Channel"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-conversation-channel"
seccion: "Sub-Account (Formerly location) > Conversation Channel > Get Conversation Channel"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/conversationChannels/:type"
---

# Get Conversation Channel

```http
GET /locations/:locationId/conversationChannels/:type
```

Get the conversation channel providers configured for a location by type (SMS or Email)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **type** `string` _required_ — Channel type to retrieve providers for
  - Available options: `SMS`, `Email`

### Response (200 · application/json)

Retrieved all the conversation channels

**Schema**

- **conversationChannel** `object` _required_

```json
{
  "conversationChannel": {
    "SMS": [
      {
        "conversationProvider": {
          "_id": "twilio_provider",
          "name": "Twilio",
          "type": "SMS",
          "default": true
        }
      }
    ],
    "Email": [
      {
        "conversationProvider": {
          "_id": "twilio_provider",
          "name": "Twilio",
          "type": "SMS",
          "default": true
        }
      }
    ]
  }
}
```
