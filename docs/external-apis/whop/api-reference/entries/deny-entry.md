---
title: "Deny entry"
source: "https://docs.whop.com/api-reference/entries/deny-entry"
capturado: "2026-08-30"
metodo: "POST"
path: "/entries/{id}/deny"
---

# Deny entry

> Deny a pending waitlist entry, preventing the user from gaining access to the plan.

Required permissions:
 - `plan:waitlist:manage`
 - `plan:basic:read`
 - `member:email:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /entries/{id}/deny`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-entries-id-deny) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)