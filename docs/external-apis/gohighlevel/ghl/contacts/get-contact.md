---
title: "Get Contact"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-contact"
seccion: "Contacts > Contacts > Get Contact"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/:contactId"
---

# Get Contact

```http
GET /contacts/:contactId
```

Retrieves a contact by its unique identifier.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Unique identifier of the contact

### Response (200 · application/json)

Successful response

**Schema**

- **contact** `object` — Contact details

```json
{
  "contact": {
    "id": "seD4PfOuKoVMLkEZqohJ",
    "name": "rubika deo",
    "firstName": "rubika",
    "lastName": "Deo",
    "email": "[email protected]",
    "phone": "+18832327657",
    "locationId": "ve9EPM428h8vShlRW1KT"
  }
}
```
