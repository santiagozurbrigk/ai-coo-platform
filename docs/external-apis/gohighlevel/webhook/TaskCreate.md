---
title: "Task"
source: "https://marketplace.gohighlevel.com/docs/webhook/TaskCreate"
seccion: "Webhook > TaskCreate"
api_version: "v3"
capturado: "2026-08-30"
---

# Task

Called whenever a task is created

#### Schema

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "assignedTo": {
      "type": "string"
    },
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "dueDate": {
      "type": "string"
    }
  }
}
```

#### Example

```json
{
  "type": "TaskCreate",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "id": "UlRWGLSXh0ji5qbiGu4i",
  "assignedTo": "63e4qiWDsFJjOYAC8phG",
  "body": "Loram ipsum",
  "contactId": "CWBf1PR9LvvBkcYqiXlc",
  "title": "Loram ipsum",
  "dateAdded": "2021-11-26T12:41:02.193Z",
  "dueDate": "2021-11-26T12:41:02.193Z"
}
```
