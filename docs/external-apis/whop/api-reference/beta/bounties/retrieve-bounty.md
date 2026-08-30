---
title: "Retrieve Bounty"
source: "https://docs.whop.com/api-reference/beta/bounties/retrieve-bounty"
capturado: "2026-08-30"
metodo: "GET"
path: "/bounties/{id}"
---

# Retrieve Bounty

> Retrieves a bounty by ID. Authentication is optional: a request with no credential reads the bounty when it is publicly visible — published or completed, and not restricted to a private experience's members. Bounties outside the caller's scope, and bounties not publicly visible to an anonymous caller, return `404`.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /bounties/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-bounties-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)