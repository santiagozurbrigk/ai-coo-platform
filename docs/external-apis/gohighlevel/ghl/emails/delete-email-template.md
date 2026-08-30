---
title: "Delete a template"
source: "https://marketplace.gohighlevel.com/docs/ghl/emails/delete-email-template"
seccion: "Email > Templates > Delete a template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/emails/locations/:locationId/templates/:templateId"
---

# Delete a template

```http
DELETE /emails/locations/:locationId/templates/:templateId
```

Delete a template

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **templateId** `string` _required_ — Template ID

### Response (200 · application/json)

Success

**Schema**

- **deleted** `boolean` _required_ — Whether the template was deleted successfully
- **traceId** `string` — Trace ID of the request

```json
{
  "deleted": true,
  "traceId": "0c52e980-41f6-4be7-8c4b-32332ss"
}
```
