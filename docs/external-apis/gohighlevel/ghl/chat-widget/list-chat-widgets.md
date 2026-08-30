---
title: "List Chat Widgets"
source: "https://marketplace.gohighlevel.com/docs/ghl/chat-widget/list-chat-widgets"
seccion: "Chat Widget > Chat Widget > List Chat Widgets"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/chat-widget/list"
---

# List Chat Widgets

```http
GET /chat-widget/list
```

Retrieves a list of chat widgets for a specific location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — The location ID
- **offset** `string` _required_ — Row offset. Defaults to 0, capped at 10000.
- **limit** `string` _required_ — Page size. Must be greater than 0, capped at 100.
- **chatType** `string` — The type of chat widget. Supports normal ChatType values, plus the virtual umbrella "webChat" (maps to facebookChat/emailChat/instagramChat/waChat).
  - Available options: `liveChat`, `waChat`, `emailChat`, `allInOneChat`, `voiceAiChat`, `facebookChat`, `instagramChat`, `webChat`
- **excludeChatType** `string` — The type of chat widget
  - Available options: `liveChat`, `waChat`, `emailChat`, `allInOneChat`, `voiceAiChat`, `facebookChat`, `instagramChat`
- **voiceAiAgentId** `string` — The voice AI agent ID
- **creationSource** `string` — The source that created the widget
  - Available options: `chat-widget`, `a2pCompliance`, `public-api`, `snapshot`
- **excludeCreationSource** `string` — Exclude widgets with this creation source
  - Available options: `chat-widget`, `a2pCompliance`, `public-api`, `snapshot`

### Response (200 · application/json)

Success

**Schema**

- **chatWidgets** `object[]` _required_ — Matching chat widgets for this page
- **totalCount** `number` _required_ — Total widgets matching the filters, ignoring limit and offset

```json
{
  "chatWidgets": [
    {
      "_id": "ve9EPM428h8vShlRWsss",
      "name": "Chat Widget 1",
      "chatType": "emailChat",
      "default": false,
      "creationSource": "chat-widget",
      "settings": {
        "legalMsg": "By submitting you agree to our terms.",
        "advanceSettings": {}
      },
      "createdAt": "2026-08-14T02:37:09.128Z",
      "updatedAt": "2026-08-18T07:21:26.939Z"
    }
  ],
  "totalCount": 42
}
```
