---
title: "Delete User"
source: "https://marketplace.gohighlevel.com/docs/ghl/users/delete-user"
seccion: "Users > Users > Delete User"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/users/:userId"
---

# Delete User

```http
DELETE /users/:userId
```

Delete User

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Response (200 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Indicates whether the user deletion was queued successfully
- **message** `string` — Message describing the result of the deletion request

```json
{
  "succeeded": true,
  "message": "Queued deleting user with e-mail [email protected] and name John Deo. Will take effect in a few minutes."
}
```
