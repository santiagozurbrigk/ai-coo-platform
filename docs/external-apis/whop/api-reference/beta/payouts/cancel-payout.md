---
title: "Cancel Payout"
source: "https://docs.whop.com/api-reference/beta/payouts/cancel-payout"
capturado: "2026-08-30"
metodo: "POST"
path: "/payouts/{id}/cancel"
---

# Cancel Payout

> Cancels a payout that is still in review and returns the funds, fees included, to the balance. A payout can be canceled while its status is `in_review`. A `requested` payout is still being prepared (its funds may be converting) and answers 409 until it reaches review; from `processing` on, the money is on its way and the answer is 409 with error type `not_cancelable`. Canceling a payout that is already canceled succeeds and returns it unchanged.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /payouts/{id}/cancel`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-payouts-id-cancel) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)