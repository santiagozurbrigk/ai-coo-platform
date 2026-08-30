---
title: "Update Opportunity"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/update-opportunity"
seccion: "Opportunities > Opportunities > Update Opportunity"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/opportunities/:id"
---

# Update Opportunity

```http
PUT /opportunities/:id
```

Update Opportunity

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Opportunity Id

### Request body (application/json)

**Body required**

- **pipelineId** `string` — pipeline Id
- **name** `string` — Name of the opportunity
- **pipelineStageId** `string` — Identifier of the pipeline stage
- **status** `string` — Current status of the opportunity
  - Available options: `open`, `won`, `lost`, `abandoned`, `all`
- **monetaryValue** `number` — Monetary value of the opportunity
- **forecastExpectedCloseDate** `string` — Expected close date. Supported formats: YYYY/MM/DD, MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY, YYYY.MM.DD, MM.DD.YYYY, or ISO 8601
- **forecastProbability** `number` — Forecast probability
- **assignedTo** `string` — Identifier of the user the opportunity is assigned to
- **customFields** `object[]` — Update custom fields to opportunities.

```json
{
  "pipelineId": "bCkKGpDsyPP4peuKowkG",
  "name": "First Opps",
  "pipelineStageId": "7915dedc-8f18-44d5-8bc3-77c04e994a10",
  "status": "open",
  "monetaryValue": 220,
  "forecastExpectedCloseDate": "2026-04-23",
  "forecastProbability": 20,
  "assignedTo": "082goXVW3lIExEQPOnd3",
  "customFields": [
    {
      "id": "6dvNaf7VhkQ9snc5vnjJ",
      "fieldValue": "9039160788"
    }
  ]
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **opportunity** `object` — The created or retrieved opportunity object

```json
{
  "opportunity": {}
}
```
