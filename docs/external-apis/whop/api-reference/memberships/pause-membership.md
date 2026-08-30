---
title: "Pause membership"
source: "https://docs.whop.com/api-reference/memberships/pause-membership"
capturado: "2026-08-30"
metodo: "POST"
path: "/memberships/{id}/pause"
---

# Pause membership

> Pause a membership's recurring payments. The customer retains access but will not be charged until the membership is resumed.

Required permissions:
 - `member:manage`
 - `member:email:read`
 - `member:basic:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /memberships/{id}/pause`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-memberships-id-pause) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)