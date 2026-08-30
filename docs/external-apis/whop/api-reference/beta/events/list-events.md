---
title: "List Events"
source: "https://docs.whop.com/api-reference/beta/events/list-events"
capturado: "2026-08-30"
metodo: "GET"
path: "/events"
---

# List Events

> Lists identity-linked events, most recent first by default. Pass identifier for one person's journey, or omit it to list events for an account within an explicit time range. Pass direction=asc to read a journey forwards from where it starts. Events are shaped like the POST /events intake: attribution in context, identity in user.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`GET /events`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#get-events) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)