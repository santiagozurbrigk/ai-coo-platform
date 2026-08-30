---
title: "Get All Notes"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-all-notes"
seccion: "Contacts > Notes > Get All Notes"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/:contactId/notes"
---

# Get All Notes

```http
GET /contacts/:contactId/notes
```

Get All Notes

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Response (200 · application/json)

Successful response

**Schema**

- **notes** `object[]` — List of notes

```json
{
  "notes": [
    {
      "id": "HGPcayliwcdoUFzvbTok",
      "body": "lorem ipsum",
      "userId": "TUcmRxWrjqzJS8EjkxNK",
      "dateAdded": "2021-07-08T12:02:11.285Z",
      "contactId": "TUcmRxWrjqzJS8EjkxNK"
    }
  ]
}
```
