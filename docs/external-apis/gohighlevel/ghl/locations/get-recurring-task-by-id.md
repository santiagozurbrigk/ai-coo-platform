---
title: "Get Recurring Task By Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-recurring-task-by-id"
seccion: "Sub-Account (Formerly location) > Recurring Tasks > Get Recurring Task By Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/recurring-tasks/:id"
---

# Get Recurring Task By Id

```http
GET /locations/:locationId/recurring-tasks/:id
```

Get Recurring Task By Id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Recurring Task Id
- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

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
