---
title: "Delete Contact from Workflow"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/delete-contact-from-workflow"
seccion: "Contacts > Workflow > Delete Contact from Workflow"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/contacts/:contactId/workflow/:workflowId"
---

# Delete Contact from Workflow

```http
DELETE /contacts/:contactId/workflow/:workflowId
```

Delete Contact from Workflow

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **contactId** `string` _required_ — Contact Id
- **workflowId** `string` _required_ — Workflow Id

### Request body (application/json)

**Body required**

- **eventStartTime** `string` — Start time of the workflow event (ISO 8601 format)

```json
{
  "eventStartTime": "2021-06-23T03:30:00+01:00"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **succeeded** `boolean` — Whether the workflow operation was successful
- **succeded** `boolean` — Legacy misspelling of `succeeded`. Deprecated; use `succeeded`.

```json
{
  "succeeded": true
}
```
