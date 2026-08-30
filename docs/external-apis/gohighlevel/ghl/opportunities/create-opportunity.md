---
title: "Create Opportunity"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-opportunity"
seccion: "Opportunities > Opportunities > Create Opportunity"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/opportunities/"
---

# Create Opportunity

```http
POST /opportunities/
```

Create Opportunity

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **pipelineId** `string` _required_ — pipeline Id
- **locationId** `string` _required_ — Identifier of the location (sub-account)
- **name** `string` _required_ — Name of the opportunity
- **pipelineStageId** `string` — Identifier of the pipeline stage
- **status** `string` _required_ — Current status of the opportunity
  - Available options: `open`, `won`, `lost`, `abandoned`, `all`
- **contactId** `string` _required_ — Identifier of the contact linked to the opportunity
- **monetaryValue** `number` — Monetary value of the opportunity
- **forecastExpectedCloseDate** `string` — Expected close date. Supported formats: YYYY/MM/DD, MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY, YYYY.MM.DD, MM.DD.YYYY, or ISO 8601
- **forecastProbability** `number` — Forecast probability
- **assignedTo** `string` — Identifier of the user the opportunity is assigned to
- **customFields** `object[]` — Add custom fields to opportunities.

```json
{
  "pipelineId": "VDm7RPYC2GLUvdpKmBfC",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "name": "First Opps",
  "pipelineStageId": "7915dedc-8f18-44d5-8bc3-77c04e994a10",
  "status": "open",
  "contactId": "mTkSCb1UBjb5tk4OvB69",
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

### Response (201 · application/json)

Successful response

**Schema**

- **opportunity** `object` — The created or retrieved opportunity object

```json
{
  "opportunity": {}
}
```
