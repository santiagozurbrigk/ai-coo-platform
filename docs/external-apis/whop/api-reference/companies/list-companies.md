---
title: "List companies"
source: "https://docs.whop.com/api-reference/companies/list-companies"
capturado: "2026-08-30"
metodo: "GET"
path: "/companies"
---

# List companies

> Returns a paginated list of companies. When parent_company_id is provided, lists connected accounts under that platform. When omitted, lists companies the current user has access to.

Required permissions:
 - `company:basic:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /companies`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-companies) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)