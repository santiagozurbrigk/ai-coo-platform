---
title: "Create Recurring Task"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/create-recurring-task"
seccion: "Sub-Account (Formerly location) > Recurring Tasks > Create Recurring Task"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/locations/:locationId/recurring-tasks"
---

# Create Recurring Task

```http
POST /locations/:locationId/recurring-tasks
```

Create Recurring Task

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_

### Request body (application/json)

**Body required**

- **title** `string` _required_ — Name of the task
- **description** `string` — Description of the task
- **contactIds** `string[]` — Contact Id
- **owners** `string[]` — Assigned To
- **rruleOptions** `object` _required_ — Recurring rules
- **ignoreTaskCreation** `boolean` — Create initial task or not

```json
{
  "title": "Task Name",
  "description": "Task Description",
  "contactIds": [
    "sx6wyHhbFdRXh302Lunr"
  ],
  "owners": [
    "sx6wyHhbFdRXh302Lunr"
  ],
  "rruleOptions": {
    "intervalType": "hourly",
    "interval": 1,
    "startDate": "2025-07-23T10:00:00.000Z",
    "dueAfterSeconds": 600
  },
  "ignoreTaskCreation": true
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **recurringTask** `object` _required_ — Recurring Tasks

```json
{
  "recurringTask": {
    "id": "sx6wyHhbFdRXh302Lunr",
    "title": "Task Name",
    "description": "Task Description",
    "locationId": "sx6wyHhbFdRXh302Lunr",
    "updatedAt": "2021-04-15T10:00:00.000Z",
    "createdAt": "2021-04-15T10:00:00.000Z",
    "rruleOptions": {
      "createTaskIfOverDue": false,
      "interval": 1,
      "intervalType": "hourly",
      "startDate": "2024-10-29T12:34:03.000Z",
      "dueAfterSeconds": 600,
      "count": 550
    },
    "totalOccurrence": 10,
    "deleted": false,
    "assignedTo": "sx6wyHhbFdRXh302Lunr",
    "contactId": "v5cEPM428h8vShlRW1KT"
  }
}
```
