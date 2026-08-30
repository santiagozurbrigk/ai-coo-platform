---
title: "Duplicate experience"
source: "https://docs.whop.com/api-reference/experiences/duplicate-experience"
capturado: "2026-08-30"
metodo: "POST"
path: "/experiences/{id}/duplicate"
---

# Duplicate experience

> Duplicates an existing experience. The name will be copied, unless provided. The new experience will be attached to the same products as the original experience.
If duplicating a Forum or Chat experience, the new experience will have the same settings as the original experience, e.g. who can post, who can comment, etc.
No content, e.g. posts, messages, lessons from within the original experience will be copied.


Required permissions:
 - `experience:create`



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /experiences/{id}/duplicate`** — ver [ENDPOINTS-api-v1-stable.md](../../ENDPOINTS-api-v1-stable.md#post-experiences-id-duplicate) · spec: [`openapi/api-v1-stable.json`](../../openapi/api-v1-stable.json)