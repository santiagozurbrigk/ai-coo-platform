---
title: "Get Agent Action"
source: "https://marketplace.gohighlevel.com/docs/ghl/voice-ai/get-action"
seccion: "Voice AI > Actions > Get Agent Action"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/voice-ai/actions/:actionId"
---

# Get Agent Action

```http
GET /voice-ai/actions/:actionId
```

Retrieve details of a specific action by its ID. Returns the action configuration including actionParameters.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **actionId** `string` _required_ — Unique identifier for the action

### Query parameters

- **locationId** `string` _required_ — Location ID

### Response (200 · application/json)

Action details retrieved successfully

**Schema**

- **id** `string` _required_ — Unique identifier for the action
- **actionType** `string` _required_ — Type of action
  - Available options: `CALL_TRANSFER`, `DATA_EXTRACTION`, `IN_CALL_DATA_EXTRACTION`, `WORKFLOW_TRIGGER`, `SMS`, `APPOINTMENT_BOOKING`, `CUSTOM_ACTION`, `KNOWLEDGE_BASE`
- **name** `string` _required_ — Human-readable name for this action
- **actionParameters** `object` _required_ — Action parameters - structure varies by actionType

```json
{
  "id": "507f1f77bcf86cd799439011",
  "actionType": "CALL_TRANSFER",
  "name": "Transfer to Manager",
  "actionParameters": {
    "triggerPrompt": "When the caller asks to speak to a manager",
    "transferToType": "number",
    "transferToValue": "+12345678901",
    "triggerMessage": "Let me transfer you to a manager right away",
    "hearWhisperMessage": true
  }
}
```
