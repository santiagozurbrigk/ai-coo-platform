---
title: "Update Card"
source: "https://docs.whop.com/api-reference/beta/cards/update-card"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/cards/{id}"
---

# Update Card

> Update, freeze, or cancel a card. Updating the card's name, billing address, or limits requires both `payout:account:update` and `company:balance:read`; a card's assigned holder may update their own card's pin and frozen state with any user token.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`PATCH /cards/{id}`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#patch-cards-id) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)