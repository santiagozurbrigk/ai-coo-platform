---
title: "Add Followers"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/add-followers-opportunity"
seccion: "Opportunities > Followers > Add Followers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/opportunities/:id/followers"
---

# Add Followers

```http
POST /opportunities/:id/followers
```

Add Followers

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Opportunity Id

### Request body (application/json)

**Body required**

- **followers** `string[]` _required_ — Array of user IDs to add or remove as followers (max 10)

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

- **followers** `string[]` — Current list of all follower user IDs after the operation
- **followersAdded** `string[]` — User IDs that were successfully added as followers

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
