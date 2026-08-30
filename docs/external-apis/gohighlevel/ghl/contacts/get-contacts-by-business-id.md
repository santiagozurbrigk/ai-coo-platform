---
title: "Get Contacts By BusinessId"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/get-contacts-by-business-id"
seccion: "Contacts > Contacts > Get Contacts By BusinessId"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/contacts/business/:businessId"
---

# Get Contacts By BusinessId

```http
GET /contacts/business/:businessId
```

Get Contacts By BusinessId

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **businessId** `string` _required_ — Business Id

### Query parameters

- **limit** `string` — Maximum number of records per page (up to 100, default 25)
- **locationId** `string` _required_ — Location Id
- **skip** `string` — Number of records to skip
- **query** `string` — Search query (name, email, phone)
- **startAfter** `string[]` — Cursor for pagination (comma-separated name,id pair)

### Response (200 · application/json)

Successful response

**Schema**

- **contacts** `object[]` — List of contacts associated with the business
- **count** `number` — Total number of contacts matching the query

```json
{
  "contacts": [
    {
      "id": "ocQHyuzHvysMo5N5VsXc",
      "locationId": "C2QujeCh8ZnC7al2InWR",
      "email": "[email protected]",
      "country": "DE",
      "source": "xyz form",
      "dateAdded": "2020-10-29T09:31:30.255Z"
    }
  ],
  "count": 10
}
```
