---
title: "Create Bounty Submission"
source: "https://docs.whop.com/api-reference/beta/bounty-submissions/create-bounty-submission"
capturado: "2026-08-30"
metodo: "POST"
path: "/bounty_submissions"
---

# Create Bounty Submission

> Creates a submission on a workforce bounty. Include a `deliverable` payload — any combination of links and uploaded files, with at least one of the two — and the submission goes straight to review; create is the only step. For `data_capture` bounties, omit the deliverable: this starts a claimed attempt whose proof accumulates server-side, and the separate submit endpoint sends it to review once complete. Requires a user credential — account API keys cannot author submissions.



## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /bounty_submissions`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-bounty-submissions) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)