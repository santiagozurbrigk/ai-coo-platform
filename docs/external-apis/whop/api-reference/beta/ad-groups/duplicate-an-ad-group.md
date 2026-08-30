---
title: "Duplicate an Ad Group"
source: "https://docs.whop.com/api-reference/beta/ad-groups/duplicate-an-ad-group"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad_groups/{id}/duplicate"
---

# Duplicate an Ad Group

> Creates copies of the ad group in `duplicating` status and returns them — into its own campaign, or into target_ad_campaign_id (which must belong to the same account and be compatible with the ad group's targeting and goals); each copy transitions to its final status (matching the source's active/paused state) once duplication completes. Poll each returned ad group until it leaves `duplicating` — a copy that could not be completed is deleted and returns 404.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /ad_groups/{id}/duplicate`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-ad-groups-id-duplicate) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)