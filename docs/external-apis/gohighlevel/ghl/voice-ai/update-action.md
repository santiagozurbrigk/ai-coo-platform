---
title: "Update Agent Action"
source: "https://marketplace.gohighlevel.com/docs/ghl/voice-ai/update-action"
seccion: "Voice AI > Actions > Update Agent Action"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/voice-ai/actions/:actionId"
---

# Update Agent Action

```http
PUT /voice-ai/actions/:actionId
```

Update an existing action for a voice AI agent. Modifies the behavior and configuration of an agent action.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **actionId** `string` _required_ — Unique identifier for the action

### Request body (application/json)

**Body required**

- **agentId** `string` _required_ — Agent ID to attach the action to
- **locationId** `string` _required_ — Location ID
- **actionType** `string` _required_ — Type of action
  - Available options: `CALL_TRANSFER`, `DATA_EXTRACTION`, `IN_CALL_DATA_EXTRACTION`, `WORKFLOW_TRIGGER`, `SMS`, `APPOINTMENT_BOOKING`, `CUSTOM_ACTION`, `KNOWLEDGE_BASE`
- **name** `string` _required_ — Human-readable name for this action
- **actionParameters** `object` _required_ — Action parameters - structure varies by actionType

```json
{
  "agentId": "507f1f77bcf86cd799439011",
  "locationId": "507f1f77bcf86cd799439012",
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

### Response (200 · application/json)

Action updated successfully

**Schema**

- **id** `string` _required_ — Unique identifier for the created action
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
