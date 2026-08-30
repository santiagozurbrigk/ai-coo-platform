---
title: "Get Chat Widget by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/chat-widget/get-chat-widget-by-id"
seccion: "Chat Widget > Chat Widget > Get Chat Widget by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/chat-widget/data/:locationId/:id"
---

# Get Chat Widget by ID

```http
GET /chat-widget/data/:locationId/:id
```

Returns the full chat widget configuration for the given location and widget ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — The chat widget ID
- **locationId** `string` _required_ — The location ID

### Response (200 · application/json)

**Schema**

- **_id** `string` _required_ — Chat widget ID
- **version** `number` _required_ — Schema version of the widget
- **chatType** `string` _required_ — Chat Type. Reads are not restricted to the public-API write allow-list, so any stored chat type can be returned here.
  - Available options: `liveChat`, `waChat`, `emailChat`, `allInOneChat`, `voiceAiChat`, `facebookChat`, `instagramChat`
- **name** `string` _required_ — Widget name
- **locationId** `string` _required_ — The location ID that owns this widget
- **deleted** `boolean` _required_ — Whether the widget is soft-deleted
- **default** `boolean` _required_ — Whether this is the default widget for the location
- **settings** `object` — Widget settings
- **creationSource** `string` — How the widget was created
  - Available options: `chat-widget`, `a2pCompliance`, `public-api`, `snapshot`
- **updatedBy** `string` — ID of the user who last updated the widget
- **originId** `string` — ID of the widget this one was cloned or imported from
- **createdAt** `string` _required_ — Creation timestamp (ISO 8601)
- **updatedAt** `string` _required_ — Last update timestamp (ISO 8601)

```json
{
  "_id": "ve9EPM428h8vShlRWsss",
  "version": 2,
  "chatType": "emailChat",
  "name": "Chat Widget 1",
  "locationId": "ve9EPM428h8vShlRWsss",
  "deleted": false,
  "default": false,
  "settings": {
    "acknowledgementDetails": {},
    "agencyName": "Example Agency",
    "agencyWebsite": "https://example.com",
    "allowAvatarImage": true,
    "autoCountryCode": true,
    "countryCode": "US",
    "chatType": "emailChat",
    "promptType": "avatar",
    "chatIcon": "messageChatCircle",
    "enableRevisitMessage": true,
    "heading": "Welcome to Our Website",
    "legalMsg": "By using this website, you agree to our terms and conditions.",
    "liveChatAckMsg": "Thank you for reaching out. How may I assist you today?",
    "liveChatEndedMsg": "Thank you for chatting with us. Have a great day!",
    "liveChatFeedbackMsg": "We would appreciate your feedback. Please rate your experience.",
    "liveChatFeedbackNote": "Your feedback helps us improve our services.",
    "liveChatIntroMsg": "Hello! Welcome to our live chat support. How can I assist you today?",
    "liveChatUserInactiveMsg": "Are you still there? Please let us know if you need assistance.",
    "liveChatUserInactiveTime": "5 minutes",
    "liveChatVisitorInactiveMsg": "Looks like you stepped away. Feel free to return whenever you need help.",
    "liveChatVisitorInactiveTime": "10 minutes",
    "locale": "en-us",
    "promptAvatar": "avatar.jpg",
    "promptAvatarAltText": "company logo",
    "isPromptAvatarImageOptimize": false,
    "promptMsg": "Need assistance? Feel free to ask us anything!",
    "revisitPromptMsg": "Welcome back! How can we help you today?",
    "sendActionText": "Send",
    "showAgencyBranding": true,
    "showConsentCheckbox": true,
    "showLiveChatWelcomeMsg": true,
    "showPrompt": true,
    "subHeading": "We are here to help you!",
    "successMsg": "Your message has been sent successfully.",
    "supportContact": "[email protected]",
    "thankYouMsg": "Thank you for visiting our website!",
    "theme": {},
    "waNumber": "+1234567890",
    "widgetPrimaryColor": "#4285F4",
    "representativeAssignedMessage": "#4285F4",
    "dimensions": {},
    "advanceSettings": {},
    "locationCountryCode": "US",
    "widgetPlacement": "embedded",
    "loadStrategy": "interaction"
  },
  "creationSource": "chat-widget",
  "updatedBy": "oHJiAh0wDG3BzmzACVD6",
  "originId": "ve9EPM428h8vShlRWsss",
  "createdAt": "2026-08-17T09:24:11.123Z",
  "updatedAt": "2026-08-17T09:24:11.123Z"
}
```
