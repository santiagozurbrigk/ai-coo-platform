---
title: "Get Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/voice-ai/get-agent"
seccion: "Voice AI > Agents > Get Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/voice-ai/agents/:agentId"
---

# Get Agent

```http
GET /voice-ai/agents/:agentId
```

Retrieve detailed configuration and settings for a specific voice AI agent

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_ — Unique agent identifier

### Query parameters

- **locationId** `string` _required_ — Location ID

### Response (200 · application/json)

Agent details retrieved successfully

**Schema**

- **id** `string` _required_ — Unique identifier for the created agent
- **locationId** `string` _required_ — Unique identifier for the location where this agent operates
- **agentName** `string` _required_ — Display name of the voice AI agent
- **businessName** `string` _required_ — Name of the business this agent represents
- **welcomeMessage** `string` _required_ — Greeting message spoken when the agent answers calls
- **agentPrompt** `string` _required_ — Custom instructions defining the agent's behavior
- **voiceId** `string` _required_ — Identifier for the speech synthesis voice being used
- **language** `string` _required_ — Language code for the agent's speech and understanding
- **patienceLevel** `string` _required_ — Current tolerance level for caller response delays
- **maxCallDuration** `number` _required_ — Maximum call duration in seconds, between 180-900 **Possible values:** `>= 180` and `<= 900`
- **sendUserIdleReminders** `boolean` _required_ — Indicates whether automatic idle reminders are enabled
- **reminderAfterIdleTimeSeconds** `number` _required_ — Seconds to wait before sending idle reminders, between 1-20 **Possible values:** `>= 1` and `<= 20`
- **inboundNumber** `string` — Phone number for receiving inbound calls
- **numberPoolId** `string` — Identifier for the number pool managing this agent's phone allocation
- **callEndWorkflowIds** `string[]` — Array of workflow IDs triggered automatically when calls end
- **sendPostCallNotificationTo** `object` — Current post-call notification settings including recipient configuration
- **agentWorkingHours** `object[]` — Time intervals when the agent accepts calls, organized by day of week
- **timezone** `string` _required_ — IANA timezone identifier for working hours and scheduling
- **isAgentAsBackupDisabled** `boolean` _required_ — Indicates whether this agent is excluded from backup scenarios
- **translation** `object` — Current language translation settings including enablement status and target language
- **actions** `object[]` _required_ — Raw actions configured for this agent with complete actionParameters structure

```json
{
  "id": "507f1f77bcf86cd799439011",
  "locationId": "LOC123456789ABCDEF",
  "agentName": "Customer Support Agent",
  "businessName": "Acme Corporation",
  "welcomeMessage": "Hello! Thank you for calling. How can I assist you today?",
  "agentPrompt": "You are a helpful customer service representative.",
  "voiceId": "507f1f77bcf86cd799439011",
  "language": "en-US",
  "patienceLevel": "medium",
  "maxCallDuration": 600,
  "sendUserIdleReminders": true,
  "reminderAfterIdleTimeSeconds": 5,
  "inboundNumber": "+1234567890",
  "numberPoolId": "pool_507f1f77bcf86cd799439011",
  "callEndWorkflowIds": [],
  "sendPostCallNotificationTo": {
    "admins": true,
    "allUsers": false,
    "contactAssignedUser": false,
    "specificUsers": [],
    "customEmails": []
  },
  "agentWorkingHours": [],
  "timezone": "America/New_York",
  "isAgentAsBackupDisabled": false,
  "translation": {
    "enabled": false,
    "language": "es"
  },
  "actions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "actionType": "CALL_TRANSFER",
      "name": "Transfer to Manager",
      "actionParameters": {
        "triggerPrompt": "When caller asks for manager",
        "triggerMessage": "Let me transfer you",
        "transferToType": "number",
        "transferToValue": "+1234567890"
      }
    }
  ]
}
```
