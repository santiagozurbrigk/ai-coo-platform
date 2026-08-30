---
title: "Get Note"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-note"
seccion: "Contacts > Notes > Get Note"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/:contactId/notes/:id"
---

# Get Note

```http
GET /contacts/:contactId/notes/:id
```

Get Note

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **id** `string` _required_ — Note Id

### Response (200 · application/json)

Successful response

**Schema**

- **note** `object` — Note details

```json
{
  "note": {
    "id": "HGPcayliwcdoUFzvbTok",
    "body": "lorem ipsum",
    "userId": "TUcmRxWrjqzJS8EjkxNK",
    "dateAdded": "2021-07-08T12:02:11.285Z",
    "contactId": "TUcmRxWrjqzJS8EjkxNK"
  }
}
```
