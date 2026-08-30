---
title: "Submit Bounty Submission"
source: "https://docs.whop.com/api-reference/beta/bounty-submissions/submit-bounty-submission"
capturado: "2026-08-30"
metodo: "POST"
path: "/bounty_submissions/{id}/submit"
---

# Submit Bounty Submission

> Submits a claimed attempt for review. A livestream attempt needs an ended proof stream and can attach an optional `deliverable` — links, files, and a caption in any combination; if the attempt already went to review when its stream ended, the payload attaches to it once, until reviewers start voting. A data capture attempt instead needs enough validated clip time and takes no payload. Only the worker who started the attempt can submit it — account API keys cannot.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /bounty_submissions/{id}/submit`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-bounty-submissions-id-submit) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)