---
title: "Account Link"
source: "https://docs.whop.com/api-reference/account-links/account-link"
capturado: "2026-08-30"
---

# Account Link

> A temporary, time-limited URL that grants a user access to an external account management page.

<ResponseExample>
  ```json Example theme={null}
  {
  	"expires_at": "2023-12-01T05:00:00.401Z",
  	"url": "https://whop.com/verify-identity/biz_xxxxxxxxx/"
  }
  ```
</ResponseExample>

<ResponseField name="expires_at" type="string<date-time>" required>
  The timestamp after which this account link URL is no longer valid.

  Example: `2023-12-01T05:00:00.401Z`
</ResponseField>

<ResponseField name="url" type="string" required>
  The temporary URL to redirect the user to for account access. Expires at the time specified by expires\_at.

  Example: `https://whop.com/verify-identity/biz_xxxxxxxxx/`
</ResponseField>
