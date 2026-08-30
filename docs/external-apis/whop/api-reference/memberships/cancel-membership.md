---
title: "Cancel membership"
source: "https://docs.whop.com/api-reference/memberships/cancel-membership"
capturado: "2026-08-30"
metodo: "POST"
path: "/memberships/{id}/cancel"
---

# Cancel membership

> Cancel a membership either immediately or at the end of the current billing period. Immediate cancellation revokes access right away.

Required permissions:
 - `membership:cancel`
 - `member:email:read`
 - `member:basic:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /memberships/{id}/cancel`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-memberships-id-cancel) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)