---
title: "Remove Contact From Campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/remove-contact-from-campaign"
seccion: "Contacts > Campaigns > Remove Contact From Campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/contacts/:contactId/campaigns/:campaignId"
---

# Remove Contact From Campaign

```http
DELETE /contacts/:contactId/campaigns/:campaignId
```

Remove Contact From Campaign

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **campaignId** `string` _required_ — Campaign Id

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
