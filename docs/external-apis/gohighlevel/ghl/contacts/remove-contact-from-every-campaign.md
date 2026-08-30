---
title: "Remove Contact From Every Campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/remove-contact-from-every-campaign"
seccion: "Contacts > Campaigns > Remove Contact From Every Campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/contacts/:contactId/campaigns/remove-all"
---

# Remove Contact From Every Campaign

```http
DELETE /contacts/:contactId/campaigns/remove-all
```

Removes the contact from every campaign it is enrolled in.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id

### Response (200 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Whether the campaign operation was successful
- **succeded** `boolean` — Legacy misspelling of `succeeded`. Deprecated; use `succeeded`.

```json
{
  "succeeded": true
}
```
