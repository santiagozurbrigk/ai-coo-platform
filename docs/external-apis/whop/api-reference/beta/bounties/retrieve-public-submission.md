---
title: "Retrieve Public Submission"
source: "https://docs.whop.com/api-reference/beta/bounties/retrieve-public-submission"
capturado: "2026-08-30"
metodo: "GET"
path: "/bounties/{bounty_id}/submissions/{id}"
---

# Retrieve Public Submission

> Retrieves one of a bounty's publicly visible submissions in the reduced public shape — the read behind a shared proof link, whose submission is usually outside the bounty page's capped preview. Authentication is optional; a bounty that is not publicly visible, and a submission that is not publicly visible work on it, both return `404`.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /bounties/{bounty_id}/submissions/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-bounties-bounty-id-submissions-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)