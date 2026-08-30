---
title: "Get Pipeline"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/get-pipeline"
seccion: "Opportunities > Pipelines > Get Pipeline"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/opportunities/pipelines/:pipelineId"
---

# Get Pipeline

```http
GET /opportunities/pipelines/:pipelineId
```

Retrieves a single pipeline by its ID, including all its stages and configuration.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **pipelineId** `string` _required_ — The unique identifier of the pipeline

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` — Unique identifier of the pipeline
- **name** `string` — Name of the pipeline
- **stages** `array[]` — Stages belonging to this pipeline
- **showInFunnel** `boolean` — Whether the pipeline is shown in the funnel view
- **showInPieChart** `boolean` — Whether the pipeline is shown in the pie chart view
- **locationId** `string` — Identifier of the location (sub-account) this pipeline belongs to
- **useOpportunityProbability** `boolean` — Whether stage-level win probability is enabled for this pipeline
- **colorRenderMode** `string` — How pipeline/stage colors are rendered
  - Available options: `dot`, `bg-tint`, `none`
- **position** `string` — Fractional-index key used to sort pipelines. Updated when the user reorders pipelines (via drag-and-drop or the reorder modal).

```json
{
  "id": "aWdODOBVOlH1RUFKWQke",
  "name": "new pipeline",
  "stages": [],
  "showInFunnel": false,
  "showInPieChart": true,
  "locationId": "VeMHYX28Satp2p7XVKbb",
  "useOpportunityProbability": true,
  "colorRenderMode": "dot",
  "position": "a0V"
}
```
