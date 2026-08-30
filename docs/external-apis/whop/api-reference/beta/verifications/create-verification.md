---
title: "Create Verification"
source: "https://docs.whop.com/api-reference/beta/verifications/create-verification"
capturado: "2026-08-30"
metodo: "POST"
path: "/verifications"
---

# Create Verification

> Starts a hosted verification session for an account or user, or returns the active session when one already exists. Any fields you include in the request body are used to prefill the session. Send `documents` (with `document_type`) to instead verify the person from identity documents included in this request — no hosted session involved. Send `share_token` to reuse a verification another Sumsub account has already completed for this person, instead of verifying them again. If the account already has an `approved` verification the request is rejected; unlink it first to start a new one.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /verifications`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-verifications) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)