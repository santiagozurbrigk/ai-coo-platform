---
title: "Add Contact to Workflow"
source: "https://marketplace.gohighlevel.com/docs/ghl/contacts/add-contact-to-workflow"
seccion: "Contacts > Workflow > Add Contact to Workflow"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/contacts/:contactId/workflow/:workflowId"
---

# Add Contact to Workflow

```http
POST /contacts/:contactId/workflow/:workflowId
```

Add Contact to Workflow

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
