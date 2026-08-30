---
title: "Retrieve the pulse feed"
source: "https://docs.whop.com/api-reference/beta/events/retrieve-the-pulse-feed"
capturado: "2026-08-30"
metodo: "GET"
path: "/events/pulse"
---

# Retrieve the pulse feed

> Returns a fully anonymized feed of recent platform-wide money movement, most recent first: purchases, affiliate commissions, card and ad spend, app revenue, off-platform sales, wallet deposits, card loads, claimed drops, transfers between accounts, and referral bonuses. Items carry only a `type`, the underlying event name, a USD amount, a coarse location under `user`, and a timestamp coarsened to the start of the minute; missing fields are omitted, not nulled. The payload is identical for every caller; no auth is required.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /events/pulse`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-events-pulse) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)