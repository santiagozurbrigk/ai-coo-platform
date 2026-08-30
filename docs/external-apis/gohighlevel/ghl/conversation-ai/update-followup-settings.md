---
title: "Update Followup Settings"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/update-followup-settings"
seccion: "Conversation AI > Actions > Update Followup Settings"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/conversation-ai/agents/:agentId/followup-settings"
---

# Update Followup Settings

```http
PATCH /conversation-ai/agents/:agentId/followup-settings
```

Update the followup settings for an action

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **agentId** `string` _required_

### Request body (application/json)

**Body required**

- **actionIds** `string[]` _required_
- **followupSettings** `object` _required_

```json
{
  "actionIds": [
    "edxcfghbnjkimd"
  ],
  "followupSettings": {
    "dynamicChannelSwitching": true,
    "followUpHours": true,
    "workingHours": [
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
    "timezoneToUse": "contact"
  }
}
```

### Response (200 · application/json)

Success

**Schema**

- **data** `object` _required_ — Updated action details
- **success** `boolean` _required_ — Success status of the request

```json
{
  "data": {
    "id": "actionId123",
    "name": "Trigger Workflow",
    "type": "triggerWorkflow",
    "agentId": "agentId123",
    "details": {
      "workflowIds": [
        "workflow123",
        "workflow456"
      ],
      "triggerCondition": "When user requests appointment",
      "triggerMessage": "Workflow triggered successfully"
    }
  },
  "success": true
}
```
