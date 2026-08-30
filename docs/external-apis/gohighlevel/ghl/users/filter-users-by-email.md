---
title: "Filter Users by Email"
source: "https://marketplace.gohighlevel.com/docs/ghl/users/filter-users-by-email"
seccion: "Users > Search > Filter Users by Email"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/users/search/filter-by-email"
---

# Filter Users by Email

```http
POST /users/search/filter-by-email
```

Filter users by company ID, deleted status, and email array

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **companyId** `string` _required_ — Company ID to filter users
- **emails** `string` _required_ — Comma-separated list of email addresses to filter users
- **deleted** `boolean` — Filter deleted users

  **Default value:**

  `false`

- **skip** `string` — No of results to be skipped before returning the result

  **Default value:**

  `0`

- **limit** `string` — No of results to be limited before returning the result

  **Default value:**

  `25`

- **projection** `string` — Projection fields to return. Use "all" for all fields, or specify comma-separated field names. Default returns only id and email

```json
{
  "companyId": "5DP41231LkQsiKESj6rh",
  "emails": "[email protected],[email protected]",
  "deleted": false,
  "skip": "1",
  "limit": "10",
  "projection": "all"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **users** `object[]` — List of users matching the search criteria
- **count** `number` — Total number of users matching the search criteria

```json
{
  "users": [
    {
      "id": "0IHuJvc2ofPAAA8GzTRi",
      "firstName": "John",
      "lastName": "Deo",
      "email": "[email protected]"
    }
  ],
  "count": 1231
}
```
