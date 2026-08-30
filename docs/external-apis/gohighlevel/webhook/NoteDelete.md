---
title: "Note"
source: "https://marketplace.gohighlevel.com/docs/webhook/NoteDelete"
seccion: "Webhook > NoteDelete"
api_version: "v3"
capturado: "2026-08-30"
---

# Note

Called whenever a note is deleted

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
    "body": {
      "type": "string"
    },
    "contactId": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    }
  }
}
```

#### Example

```json
{
  "type": "NoteDelete",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "id": "otg8dTQqGLh3Q6iQI55w",
  "body": "Loram ipsum",
  "contactId": "CWBf1PR9LvvBkcYqiXlc",
  "dateAdded": "2021-11-26T12:41:02.193Z"
}
```
