---
title: "Search Users"
source: "https://marketplace.gohighlevel.com/docs/ghl/users/search-users"
seccion: "Users > Search > Search Users"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/users/search"
---

# Search Users

```http
GET /users/search
```

Search Users

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **companyId** `string` _required_ — Company ID in which the search needs to be performed
- **query** `string` — The search term for the user is matched based on the user full name, email or phone
- **skip** `string` — No of results to be skipped before returning the result

  Default value:

  `0`

- **limit** `string` — No of results to be limited before returning the result

  Default value:

  `25`

- **locationId** `string` — Location ID in which the search needs to be performed
- **type** `string` — Type of the users to be filtered in the search
- **role** `string` — Role of the users to be filtered in the search
- **ids** `string` — List of User IDs to be filtered in the search
- **sort** `string` — The field on which sort is applied in which the results need to be sorted. Default is based on the first and last name
- **sortDirection** `string` — The direction in which the results need to be sorted
- **enabled2waySync** `boolean` — Filter users by whether 2-way sync is enabled

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
