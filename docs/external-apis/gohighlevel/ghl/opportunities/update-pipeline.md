---
title: "Update Pipeline"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/update-pipeline"
seccion: "Opportunities > Pipelines > Update Pipeline"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/opportunities/pipelines/:pipelineId"
---

# Update Pipeline

```http
PUT /opportunities/pipelines/:pipelineId
```

Updates an existing pipeline. The `stages` array is a full replacement — include the `id` field on existing stages to retain them, or omit it to create a new stage. You cannot remove all stages at once. Any opportunities in removed stages are automatically migrated to the lowest-position remaining stage. Pipeline and stage names must remain unique (case-insensitive) within the location. Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-709536/75a21483123abd7](https://doc.clickup.com/8631005/d/h/87cpx-709536/75a21483123abd7)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **pipelineId** `string` _required_ — The unique identifier of the pipeline

### Request body (application/json)

**Body required**

- **name** `string` — Name of the pipeline
- **stages** `string[]` — List of stages belonging to this pipeline
- **showInFunnel** `boolean` — Whether the pipeline is shown in the funnel view
- **showInPieChart** `boolean` — Whether the pipeline is shown in the pie chart view
- **useOpportunityProbability** `boolean` — Whether stage-level win probability is enabled for this pipeline
- **colorRenderMode** `string` — How pipeline/stage colors are rendered
  - Available options: `dot`, `bg-tint`, `none`

```json
{
  "name": "pipeline",
  "stages": [
    {
      "name": "stage 1",
      "position": 1,
      "showInFunnel": true
    }
  ],
  "showInFunnel": false,
  "showInPieChart": true,
  "useOpportunityProbability": true,
  "colorRenderMode": "dot"
}
```

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
