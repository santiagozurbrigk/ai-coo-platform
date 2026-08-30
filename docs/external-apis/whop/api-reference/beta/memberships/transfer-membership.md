---
title: "Transfer Membership"
source: "https://docs.whop.com/api-reference/beta/memberships/transfer-membership"
capturado: "2026-08-30"
metodo: "POST"
path: "/memberships/{id}/transfer"
---

# Transfer Membership

> Creates a one-use transfer URL for a membership. Opening the URL while logged into a different Whop account claims the membership onto that account. The membership's buyer can generate a link for their own membership with `membership:transfer` when the product allows transfers and the membership is `trialing`, `active`, or `completed`. An account credential with `membership:update` bypasses both restrictions.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /memberships/{id}/transfer`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-memberships-id-transfer) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)