---
title: "Add Followers"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/add-followers-contact"
seccion: "Contacts > Followers > Add Followers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/:contactId/followers"
---

# Add Followers

```http
POST /contacts/:contactId/followers
```

Add Followers

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Request body (application/json)

**Body required**

- **followers** `string[]` _required_ — List of user Ids to follow or unfollow the contact

```json
{
  "followers": [
    "sx6wyHhbFdRXh302Lunr",
    "sx6wyHhbFdRXh302Lunr"
  ]
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **followers** `string[]` — Current followers after the operation
- **followersAdded** `string[]` — Followers that were added

```json
{
  "followers": [
    "sx6wyHhbFdRXh302Lunr",
    "sx6wyHhbFdRXh302LLss"
  ],
  "followersAdded": [
    "Mx6wyHhbFdRXh302Luer",
    "Ka6wyHhbFdRXh302LLsAm"
  ]
}
```
