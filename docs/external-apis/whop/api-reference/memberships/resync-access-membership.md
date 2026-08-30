---
title: "Resync access membership"
source: "https://docs.whop.com/api-reference/memberships/resync-access-membership"
capturado: "2026-08-30"
metodo: "POST"
path: "/memberships/{id}/resync_access"
---

# Resync access membership

> Re-run access fulfillment for a membership. Recomputes the member's content access on Whop, re-validates their Discord link (re-adding them to the server and re-assigning roles if needed), and re-fulfills TradingView indicator access. Telegram access is invite-based and cannot be resynced here. The outcome is written to the membership's logs.

Required permissions:
 - `membership:resync_access`
 - `member:email:read`
 - `member:basic:read`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /memberships/{id}/resync_access`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-memberships-id-resync-access) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)