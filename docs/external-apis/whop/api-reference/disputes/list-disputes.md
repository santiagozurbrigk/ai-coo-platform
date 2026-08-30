---
title: "List disputes"
source: "https://docs.whop.com/api-reference/disputes/list-disputes"
capturado: "2026-08-30"
metodo: "GET"
path: "/disputes"
---

# List disputes

> Returns a paginated list of disputes for a company, with optional filtering by creation date. A dispute represents a chargeback or inquiry filed by a customer against a payment.

Required permissions:
 - `payment:dispute:read`
 - `plan:basic:read`
 - `access_pass:basic:read`
 - `company:basic:read`
 - `payment:basic:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /disputes`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#get-disputes) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)