---
title: "Attach Action to Agent"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversation-ai/create-action"
seccion: "Conversation AI > Actions > Attach Action to Agent"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversation-ai/agents/:agentId/actions"
---

# Attach Action to Agent

```http
POST /conversation-ai/agents/:agentId/actions
```

Creates and attach a new action for an AI agent. Actions define specific tasks or behaviors that the agent can perform, such as booking appointments, sending follow-ups, or collecting information.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

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

### Response (201 · application/json)

Successful response

**Schema**

- **data** `object` _required_ — Created action details
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
