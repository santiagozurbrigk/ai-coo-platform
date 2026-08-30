---
title: "Patch Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/voice-ai/patch-agent"
seccion: "Voice AI > Agents > Patch Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/voice-ai/agents/:agentId"
---

# Patch Agent

```http
PATCH /voice-ai/agents/:agentId
```

Partially update an existing voice AI agent

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_ — Unique agent identifier

### Query parameters

- **locationId** `string` _required_ — Location ID

### Request body (application/json)

**Body required**

- **agentName** `string` — Display name for the voice AI agent, between 1-40 characters. Default: "My Agent {random 3 digit number}" **Possible values:** `non-empty` and `<= 40 characters`
- **businessName** `string` — Name of the business this agent represents. Default: Uses location name **Possible values:** `non-empty`
- **welcomeMessage** `string` — Initial greeting spoken when the agent answers calls. Default: Auto generated **Possible values:** `non-empty` and `<= 190 characters`
- **agentPrompt** `string` — Custom instructions defining the agent's behavior and personality. Default: Basic prompt generated automatically
- **voiceId** `string` — Identifier for the speech synthesis voice from available voice options. Default: Auto generated
- **language** `VoiceAILanguage` — Language code for the agent's speech and understanding. Default: "en-US"
  - Available options: `en-US`, `pt-BR`, `es`, `fr`, `de`, `it`, `nl-NL`, `multi`
- **patienceLevel** `PatienceLevel` — Tolerance level for caller response delays. Default: "high"
  - Available options: `low`, `medium`, `high`
- **maxCallDuration** `number` — Maximum call duration in seconds, between 180-900 (3-15 minutes). Default: 300 seconds (5 minutes) **Possible values:** `>= 180` and `<= 900`
- **sendUserIdleReminders** `boolean` — Enables automatic reminders when callers are silent. Default: true
- **reminderAfterIdleTimeSeconds** `number` — Seconds to wait before sending idle reminders, between 1-20. Default: 8 seconds **Possible values:** `>= 1` and `<= 20`
- **inboundNumber** `string` — Phone number for receiving inbound calls to this agent. Default: null
- **numberPoolId** `string` — Identifier for the number pool managing phone number allocation. Default: null
- **callEndWorkflowIds** `string[]` — Array of workflow IDs to trigger automatically when calls end. Default: [] **Possible values:** `<= 10`
- **sendPostCallNotificationTo** `object` — Configuration for post-call email notifications to various recipients. Default: []
- **agentWorkingHours** `object[]` — Time intervals defining when the agent accepts calls, organized by day of week. Default: [] (available 24/7)
- **timezone** `string` — IANA timezone identifier affecting working hours and scheduling. Default: Location timezone **Possible values:** Value must match regular expression `^[A-Za-z_]+/[A-Za-z_]+$`
- **isAgentAsBackupDisabled** `boolean` — Prevents this agent from being used as a fallback option. Default: false (Available as backup agent)
- **translation** `object` — Language translation settings including enablement flag and target language code. Rules: (1) translation.enabled can only be true if the agent's language is not en-US; (2) when enabled, translation.language must be either the agent's language or en-US; (3) when enabled, translation.language is required.

```json
{
  "agentName": "Customer Support Agent",
  "businessName": "Acme Corporation",
  "welcomeMessage": "Hello! Thank you for calling Acme Corporation. How can I assist you today?",
  "agentPrompt": "You are a helpful customer service representative. Always be polite and professional.",
  "voiceId": "507f1f77bcf86cd799439011",
  "language": "en-US",
  "patienceLevel": "low",
  "maxCallDuration": 600,
  "sendUserIdleReminders": true,
  "reminderAfterIdleTimeSeconds": 5,
  "inboundNumber": "+1234567890",
  "numberPoolId": "pool_507f1f77bcf86cd799439011",
  "callEndWorkflowIds": [
    "wf_507f1f77bcf86cd799439011",
    "wf_507f1f77bcf86cd799439012"
  ],
  "sendPostCallNotificationTo": {
    "admins": true,
    "allUsers": false,
    "contactAssignedUser": false,
    "specificUsers": [
      "user_507f1f77bcf86cd799439011"
    ],
    "customEmails": [
      "[email protected]"
    ]
  },
  "agentWorkingHours": [
    {
      "dayOfTheWeek": 1,
      "intervals": [
        {
          "startHour": 9,
          "startMinute": 0,
          "endHour": 17,
          "endMinute": 30
        }
      ]
    }
  ],
  "timezone": "America/New_York",
  "isAgentAsBackupDisabled": false,
  "translation": {
    "enabled": false,
    "language": "es"
  }
}
```

### Response (200 · application/json)

Agent updated successfully

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
  }
}
```
