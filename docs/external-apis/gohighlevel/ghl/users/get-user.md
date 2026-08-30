---
title: "Get User"
source: "https://marketplace.gohighlevel.com/docs/ghl/users/get-user"
seccion: "Users > Users > Get User"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/users/:userId"
---

# Get User

```http
GET /users/:userId
```

Get User

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **userId** `string` _required_ — User Id

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` — Unique identifier of the user
- **name** `string` — Full name of the user
- **firstName** `string` — First name of the user
- **lastName** `string` — Last name of the user
- **email** `string` — Email address of the user
- **phone** `string` — Phone number of the user
- **extension** `string` — Phone extension of the user
- **permissions** `object` — User permissions controlling access to various features
- **scopes** `string` — List of OAuth scopes granted to this user
  - Available options: `campaigns.readonly`, `campaigns.write`, `calendars.readonly`, `calendars/events.write`, `calendars/groups.write`, `calendars.write`, `contacts.write`, `contacts/bulkActions.write`, `workflows.readonly`, `workflows.write`, `triggers.write`, `funnels.write`
- **roles** `object` — Role and access configuration for the user
- **lcPhone** `object` — LC Phone Inbound Phone Numbers
- **platformLanguage** `string` — Platform language preference for the user
  - Available options: `en_US`, `es`, `fr_CA`, `fr_FR`, `nl`, `de`, `pt_PT`, `pt_BR`, `it`, `sv`, `da`, `fi`

```json
{
  "id": "0IHuJvc2ofPAAA8GzTRi",
  "name": "John Deo",
  "firstName": "John",
  "lastName": "Deo",
  "email": "[email protected]",
  "phone": "+1 808-868-8888",
  "extension": "",
  "permissions": {
    "campaignsEnabled": true,
    "campaignsReadOnly": false,
    "contactsEnabled": true,
    "workflowsEnabled": true
  },
  "scopes": [
    "contacts.write",
    "campaigns.readonly"
  ],
  "roles": {
    "type": "account",
    "role": "admin",
    "locationIds": [
      "ve9EPM428h8vShlRW1KT"
    ]
  },
  "lcPhone": {
    "locationId": "+1234556677"
  },
  "platformLanguage": "en_US"
}
```
