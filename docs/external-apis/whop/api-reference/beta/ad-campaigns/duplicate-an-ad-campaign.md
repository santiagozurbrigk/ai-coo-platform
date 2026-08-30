---
title: "Duplicate an Ad Campaign"
source: "https://docs.whop.com/api-reference/beta/ad-campaigns/duplicate-an-ad-campaign"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad_campaigns/{id}/duplicate"
---

# Duplicate an Ad Campaign

> Creates copies of the campaign in `duplicating` status and returns them; each copy transitions to `draft` once duplication completes. Poll each returned campaign until it leaves `duplicating` — a copy that could not be completed is deleted and returns 404.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /ad_campaigns/{id}/duplicate`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-ad-campaigns-id-duplicate) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)