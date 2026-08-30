---
title: "Search Targeting Options"
source: "https://docs.whop.com/api-reference/beta/ad-groups/search-targeting-options"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad_groups/targeting_options"
---

# Search Targeting Options

> Searches the ad platform's targeting taxonomy for options to target an ad group with. Each result comes back in the exact shape the ad-group body accepts for its `type`, so it can be used in `detailed_targeting`, `regions`, or `languages` as-is. A blank `query` browses the small fixed lists (behaviors, browse demographic categories, languages); interests, work employers, job titles, schools, majors, and locations need a search term.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /ad_groups/targeting_options`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-ad-groups-targeting-options) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)