---
title: "Create Pipeline"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-pipeline"
seccion: "Opportunities > Pipelines > Create Pipeline"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/opportunities/pipelines"
---

# Create Pipeline

```http
POST /opportunities/pipelines
```

Creates a new pipeline with at least one stage for a given location. Pipeline names must be unique per location (case-insensitive), and stage names must be unique within the pipeline. To enable manual win probability, set `useOpportunityProbability` to `true` and provide a `stageWinProbability` (0–100) on every stage — if any stage is missing a value, the system falls back to auto-computed probabilities based on stage position.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **name** `string` _required_ — Name of the pipeline
- **stages** `string[]` _required_ — List of stages belonging to this pipeline
- **showInFunnel** `boolean` — Whether the pipeline is shown in the funnel view
- **showInPieChart** `boolean` — Whether the pipeline is shown in the pie chart view
- **useOpportunityProbability** `boolean` — Whether stage-level win probability is enabled for this pipeline
- **locationId** `string` _required_ — Identifier of the location (sub-account) this pipeline belongs to
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
  "locationId": "ve9EPM428h8vShlRW1KT",
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
