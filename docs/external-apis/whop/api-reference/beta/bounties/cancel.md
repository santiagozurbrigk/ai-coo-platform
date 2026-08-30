---
title: "Cancel"
source: "https://docs.whop.com/api-reference/beta/bounties/cancel"
capturado: "2026-08-30"
metodo: "POST"
path: "/bounties/{id}/cancel"
---

# Cancel

> Cancels a bounty. With no in-flight work, it cancels immediately and refunds the funder. Otherwise it stops new submissions and cancels once the in-flight work resolves and pays out. Repeating the request is a no-op. A bounty that already paid out every slot returns `400`.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /bounties/{id}/cancel`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-bounties-id-cancel) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)