---
title: "Cancel Membership"
source: "https://docs.whop.com/api-reference/beta/memberships/cancel-membership"
capturado: "2026-08-30"
metodo: "POST"
path: "/memberships/{id}/cancel"
---

# Cancel Membership

> Cancels a membership. Pass `cancel_at_period_end: true` to stop auto-renewal and keep access until the current billing period ends. Omit it (or pass `false`) to revoke access immediately. Buyers cannot cancel buy-now-pay-later (`splitit`, `sezzle`) or non-trial split-pay memberships.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /memberships/{id}/cancel`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-memberships-id-cancel) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)