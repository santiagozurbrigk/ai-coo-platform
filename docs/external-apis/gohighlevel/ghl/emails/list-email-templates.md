---
title: "List templates"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/list-email-templates"
seccion: "Email > Templates > List templates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/emails/locations/:locationId/templates"
---

# List templates

```http
GET /emails/locations/:locationId/templates
```

Get list of templates by location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID

### Query parameters

- **limit** `number` — Number of templates to return **Possible values:** `>= 1` and `<= 20`

  Default value:

  `10`

- **offset** `number` — Number of templates to skip **Possible values:** `>= 0`

  Default value:

  `0`

- **search** `string` — Search by template name
- **sortBy** `string` — Field to sort by
  - Available options: `updatedAt`
- **sortOrder** `string` — Sort direction
  - Available options: `asc`, `desc`
- **archived** `boolean` — Return archived templates

  Default value:

  `false`

- **folderId** `string` — Folder to list templates from. Use 'root' for top-level listing.
- **include** `string` — Whether to include templates, folders, or both in the response. `templates` will return only templates, `folders` will return only folders, and `all` will return both.
  - Available options: `all`, `templates`, `folders`

### Response (200 · application/json)

Success

**Schema**

- **items** `object[]` _required_ — List of template and folder resources
- **total** `number` _required_ — Total count of templates and folders
- **traceId** `string` — Trace ID of the request

```json
{
  "items": [
    {
      "id": "67f15c2ae99226d5bcccb8f3",
      "name": "February Newsletter",
      "type": "template"
    }
  ],
  "total": 25,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
