---
title: "Delete Pipeline"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/delete-pipeline"
seccion: "Opportunities > Pipelines > Delete Pipeline"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/opportunities/pipelines/:pipelineId"
---

# Delete Pipeline

```http
DELETE /opportunities/pipelines/:pipelineId
```

Permanently deletes a pipeline and all opportunities within it. This action is irreversible — all opportunities across every stage of this pipeline will be removed. Ensure you have migrated or exported any opportunities before calling this endpoint.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **pipelineId** `string` _required_ — The unique identifier of the pipeline

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` — Whether the pipeline was successfully deleted
- **message** `string` — Error message if the deletion failed

```json
{
  "success": true,
  "message": "something went wrong"
}
```
