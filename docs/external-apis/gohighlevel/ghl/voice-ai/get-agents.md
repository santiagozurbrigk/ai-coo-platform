---
title: "List Agents"
source: "https://marketplace.gohighlevel.com/docs/ghl/voice-ai/get-agents"
seccion: "Voice AI > Agents > List Agents"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/voice-ai/agents"
---

# List Agents

```http
GET /voice-ai/agents
```

Retrieve a paginated list of agents for given location.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **page** `number` — Page number starting from 1 **Possible values:** `>= 1` and `<= 5000`

  Default value:

  `1`

- **pageSize** `number` — Number of items per page **Possible values:** `>= 1` and `<= 50`

  Default value:

  `10`

- **locationId** `string` _required_ — Location ID
- **query** `string` — Query

### Response (200 · application/json)

Agent list retrieved successfully.

**Schema**

- **total** `number` _required_ — Total number of items
- **page** `number` _required_ — Page number starting from 1
- **pageSize** `number` _required_ — Number of items per page
- **agents** `object[]` _required_

```json
{
  "total": 150,
  "page": 2,
  "pageSize": 10,
  "agents": [
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
  ]
}
```
