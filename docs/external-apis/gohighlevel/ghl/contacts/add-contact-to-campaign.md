---
title: "Add Contact to Campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/add-contact-to-campaign"
seccion: "Contacts > Campaigns > Add Contact to Campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/:contactId/campaigns/:campaignId"
---

# Add Contact to Campaign

```http
POST /contacts/:contactId/campaigns/:campaignId
```

Add contact to Campaign

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **campaignId** `string` _required_ — Campaign Id

**Body required**

- **** `object`

```json
{}
```

### Response (201 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Whether the campaign operation was successful
- **succeded** `boolean` — Legacy misspelling of `succeeded`. Deprecated; use `succeeded`.

```json
{
  "succeeded": true
}
```
