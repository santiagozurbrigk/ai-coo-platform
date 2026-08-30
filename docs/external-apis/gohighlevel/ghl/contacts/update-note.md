---
title: "Update Note"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/update-note"
seccion: "Contacts > Notes > Update Note"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/contacts/:contactId/notes/:id"
---

# Update Note

```http
PUT /contacts/:contactId/notes/:id
```

Update Note

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **id** `string` _required_ — Note Id

### Request body (application/json)

**Body required**

- **userId** `string` — User Id of the note author
- **body** `string` — Body content of the note
- **title** `string` — Title of the note
- **color** `string` — Hex color code for the note
- **pinned** `boolean` — Whether the note is pinned

```json
{
  "userId": "GCs5KuzPqTls7vWclkEV",
  "body": "lorem ipsum",
  "title": "Follow-up summary",
  "color": "#FFAA00",
  "pinned": false
}
```

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
