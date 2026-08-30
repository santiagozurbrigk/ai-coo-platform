---
title: "Remove Followers"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/remove-followers-contact"
seccion: "Contacts > Followers > Remove Followers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/contacts/:contactId/followers"
---

# Remove Followers

```http
DELETE /contacts/:contactId/followers
```

Remove Followers

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

### Response (200 · application/json)

Successful response

**Schema**

- **followers** `string[]` — Current followers after the operation
- **followersRemoved** `string[]` — Followers that were removed

```json
{
  "followers": [
    "sx6wyHhbFdRXh302Lunr",
    "sx6wyHhbFdRXh302LLss"
  ],
  "followersRemoved": [
    "Mx6wyHhbFdRXh302Luer",
    "Ka6wyHhbFdRXh302LLsAm"
  ]
}
```
