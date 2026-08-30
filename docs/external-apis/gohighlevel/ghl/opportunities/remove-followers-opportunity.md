---
title: "Remove Followers"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/remove-followers-opportunity"
seccion: "Opportunities > Followers > Remove Followers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/opportunities/:id/followers"
---

# Remove Followers

```http
DELETE /opportunities/:id/followers
```

Allows removal of one or all followers from an opportunity.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Opportunity Id

### Query parameters

- **isRemoveAllFollowers** `boolean` — Set to true to remove all followers from the opportunity

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

### Response (200 · application/json)

Followers successfully removed.

**Schema**

- **followers** `string[]` — Current list of all follower user IDs after the operation
- **followersRemoved** `string[]` — User IDs that were successfully removed as followers

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
