---
title: "Upsert Opportunity"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/upsert-opportunity"
seccion: "Opportunities > Opportunities > Upsert Opportunity"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/opportunities/upsert"
---

# Upsert Opportunity

```http
POST /opportunities/upsert
```

Upsert Opportunity

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **id** `string` — opportunityId
- **pipelineId** `string` _required_ — pipeline Id
- **locationId** `string` _required_ — locationId
- **followers** `string[]` _required_ — contactId
- **isRemoveAllFollowers** `boolean` _required_ — isRemoveAllFollowers
- **followersActionType** `string` _required_ — followers action type
  - Available options: `add`, `remove`
- **name** `string` — name
- **status** `string` — Current status of the opportunity
  - Available options: `open`, `won`, `lost`, `abandoned`, `all`
- **pipelineStageId** `string` — Identifier of the pipeline stage
- **monetaryValue** `object` — Monetary value of the opportunity
- **forecastExpectedCloseDate** `string` — Expected close date. Supported formats: YYYY/MM/DD, MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY, YYYY.MM.DD, MM.DD.YYYY, or ISO 8601
- **forecastProbability** `number` — Forecast probability
- **assignedTo** `string` — Identifier of the user the opportunity is assigned to
- **lostReasonId** `string` — lost reason Id

```json
{
  "id": "yWQobCRIhRguQtD2llvk",
  "pipelineId": "bCkKGpDsyPP4peuKowkG",
  "locationId": "CLu7BaljjqrEjBGKTNNe",
  "followers": "LiKJ2vnRg5ETM8Z19K7",
  "isRemoveAllFollowers": true,
  "followersActionType": "add",
  "name": "opportunity name",
  "status": "open",
  "pipelineStageId": "7915dedc-8f18-44d5-8bc3-77c04e994a10",
  "monetaryValue": 220,
  "forecastExpectedCloseDate": "2026-04-23",
  "forecastProbability": 20,
  "assignedTo": "082goXVW3lIExEQPOnd3",
  "lostReasonId": "CLu7BaljjqrEjBGKTNNe"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **opportunity** `object` _required_ — Updated / New Opportunity
- **new** `boolean` _required_ — Indicates whether the opportunity was newly created (true) or updated (false)

```json
{
  "opportunity": {},
  "new": true
}
```
