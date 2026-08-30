---
title: "Validate Pixel"
source: "https://docs.whop.com/api-reference/beta/events/validate-pixel"
capturado: "2026-08-30"
metodo: "POST"
path: "/events/validate_pixel"
---

# Validate Pixel

> Checks whether the Whop pixel is installed for an account. Recent pixel events count as proof on their own, so an account that has sent data lately comes back installed without a `url`. Pass a `url` and events from that page settle it; conversion events are also read across the hostname because they commonly fire on a later confirmation page. If the requested page hasn't sent any events lately, it is fetched and read for the pixel and conversion events wired on it. `installed` is only true when the pixel was actually seen — in the account's events or in the page.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /events/validate_pixel`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-events-validate-pixel) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)