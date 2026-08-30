---
title: "Task Search Filter"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/task-search"
seccion: "Sub-Account (Formerly location) > Tasks Search > Task Search Filter"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/locations/:locationId/tasks/search"
---

# Task Search Filter

```http
POST /locations/:locationId/tasks/search
```

Task Search

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **contactId** `string[]` — Contact Ids
- **completed** `boolean` — Task Completed Or Pending
- **assignedTo** `string[]` — Assigned User Ids
- **query** `string` — Search Value
- **limit** `number` — Limit To Api

  **Default value:**

  `25`

- **skip** `number` — Number Of Tasks To Skip

  **Default value:**

  `0`

- **businessId** `string` — Bussiness Id

```json
{
  "contactId": [
    "dSMo5jnqkJyh8YeGXM7k",
    "j5WESpmRj816VtyUuWwh"
  ],
  "completed": true,
  "assignedTo": [
    "0004Mtfsd11SBU1mBPgd"
  ],
  "query": "Task Name",
  "limit": 10,
  "skip": 10,
  "businessId": "6348240b98722079e5417332"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **tasks** `array[]`

```json
{
  "tasks": [
    null
  ]
}
```
