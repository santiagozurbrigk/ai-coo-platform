---
title: "Form Company"
source: "https://docs.whop.com/api-reference/beta/accounts/form-company"
capturado: "2026-08-30"
metodo: "POST"
path: "/accounts/{id}/form_company"
---

# Form Company

> Starts an LLC or C-Corp formation for a business account. Defaults to an LLC; set `entity_type` to `c_corp` to form a C-Corp, which additionally requires `share_structure` and officer `roles` on every founder. On submission, the application is validated and the response returns a hosted checkout URL. Once paid, the filing is submitted. Track progress through the account's [`company_formation`](/api-reference/beta/accounts/retrieve-account) field on Retrieve Account.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /accounts/{id}/form_company`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-accounts-id-form-company) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)