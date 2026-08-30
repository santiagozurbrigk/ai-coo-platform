---
title: "List identity profiles"
source: "https://docs.whop.com/api-reference/identity-profiles/list-identity-profiles"
capturado: "2026-08-30"
metodo: "GET"
path: "/identity_profiles"
---

# List identity profiles

> Returns a paginated list of identity profiles. When company_id is provided, lists IPs currently linked to that company's ledger. When omitted, lists IPs linked to any ledger the actor can read (including child companies under a parent).

Required permissions:
 - `identity:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /identity_profiles`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-identity-profiles) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)