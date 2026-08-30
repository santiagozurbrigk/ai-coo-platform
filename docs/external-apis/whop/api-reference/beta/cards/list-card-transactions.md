---
title: "List Card Transactions"
source: "https://docs.whop.com/api-reference/beta/cards/list-card-transactions"
capturado: "2026-08-30"
metodo: "GET"
path: "/card_transactions"
---

# List Card Transactions

> Lists an account's card transactions, newest first. Defaults to the account the credential belongs to. Covers every card the owner has ever had, including canceled cards and spend that predates a re-application, and team members only see transactions on the cards assigned to them. Pass `transaction_ids` to fetch specific transactions instead of paging for them.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /card_transactions`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-card-transactions) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)