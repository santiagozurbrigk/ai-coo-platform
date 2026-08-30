---
title: "Update Action"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/update-action"
seccion: "Conversation AI > Actions > Update Action"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/conversation-ai/agents/:agentId/actions/:actionId"
---

# Update Action

```http
PUT /conversation-ai/agents/:agentId/actions/:actionId
```

Updates an existing action's configuration. This includes modifying the action name, description, trigger conditions, and behavior settings.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **actionId** `string` _required_ — The unique identifier of the action ID Attached to the agent
- **agentId** `string` _required_

### Request body (application/json)

**Body required**

- **type** `string` _required_
  - Available options: `triggerWorkflow`, `updateContactField`, `appointmentBooking`, `stopBot`, `humanHandOver`, `advancedFollowup`, `transferBot`
- **name** `string` _required_
- **details** `object` _required_ — Action-specific details. The structure depends on the action type. For TRIGGER_WORKFLOW use triggerWorkflowDto, for UPDATE_CONTACT_FIELD use updateContactFieldDto, for APPOINTMENT_BOOKING use appointmentBookingDto, for STOP_BOT use stopBotDto, for HUMAN_HAND_OVER use humanHandOverDto, for ADVANCED_FOLLOWUP use advancedFollowupDto, and for TRANSFER_BOT use transferBotDto.

```json
{
  "type": "triggerWorkflow",
  "name": "Trigger a Workflow",
  "details": {
    "workflowIds": [
      "workflow123",
      "workflow456"
    ],
    "triggerCondition": "When user requests appointment",
    "triggerMessage": "Workflow triggered successfully"
  }
}
```

### Response (200 · application/json)

Successful response

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
