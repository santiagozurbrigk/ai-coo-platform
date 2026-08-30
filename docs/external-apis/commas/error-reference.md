---
title: "Error Reference"
source: "https://commasdocs.com/#error-reference"
seccion: "Conceptos de la API"
ancla: "#error-reference"
capturado: "2026-08-30"
---

# Error Reference

When something goes wrong, the API returns a descriptive error response. Here's what each HTTP status code means and what to do about it.

| Code | Status | What happened | What to do |
| --- | --- | --- | --- |
| `200` | OK | Request succeeded. | Nothing — all good! Your data is in the `data` field. |
| `201` | Created | A new resource was created. | Store the returned ID for future requests. |
| `400` | Bad Request | Your request was invalid. | Check the `errors` field in the response for field-by-field details. |
| `401` | Unauthorized | API key missing or wrong. | Check that your `x-api-key` header is included and spelled correctly. |
| `403` | Forbidden | Your API key is valid but lacks the scope this route requires (or your account isn't approved for API access). | Read the `message` — it names the missing scope. See [API Key Scopes](#api-key-scopes). |
| `404` | Not Found | The resource doesn't exist. | Double-check the ID in your URL. It may have been deleted. |
| `422` | Unprocessable Entity | The request was well-formed but failed validation (e.g. a bad value, or an action that isn't allowed in the resource's current state). | Check the `message` in the response — it names the specific problem. Common on the proration endpoints (e.g. "Subscription is not active"). |
| `429` | Too Many Requests | You've exceeded the rate limit. | Back off and retry. See [Rate Limits](#rate-limits) for the limits and recommended retry behavior. |
| `500` | Server Error | Something broke on our end. | Try again in a moment. Contact Commas support if it keeps happening. |

### Error Response Shapes

⚠ There is no machine-readable

`code`

field

Error bodies carry a human-readable `message`, not an error code enum. Branch your handling on the **HTTP status** first, and on the `message` text only where you have no alternative.

**400** — validation failure. Field errors live in `errors`:

Error Payload — 400 Bad Request

```json
{
  "status": "error",
  "message": "Validation failed",
  "data": [],
  "errors": {
    "code": ["The code field is required."],
    "service_ids": ["At least one service ID is required."]
  }
}
```

**401** — missing or invalid credentials:

Error Payload — 401 Unauthorized

```json
{
  "status": "error",
  "message": "Authentication required. Please provide X-API-KEY or Bearer token."
}
```

**403** — the key is valid but missing a required scope (see [API Key Scopes](#api-key-scopes)):

Error Payload — 403 Forbidden

```json
{
  "status": "error",
  "message": "API key does not have permission for this resource. Required scope(s): refunds"
}
```

**429** — rate limited. Note this uses a **different envelope** (`success`, not `status`):

Error Payload — 429 Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errors": {
    "rate_limit": "Rate limit exceeded, please try after 60s"
  }
}
```

ℹ Business-rule failures are 400s with a descriptive message

Rules that aren't about request shape — refund amounts, subscription state, proration eligibility — come back as `400` with the explanation in `message`, e.g. `"Refund amount exceeds remaining refundable amount. Already refunded: $10.00, Remaining: $19.99"` or `"Subscription must be active to upgrade."`. Log the whole body: there is no code to switch on.

✓ Need help?

If you're stuck, reach out to [support@fanbasis.com](mailto:support@fanbasis.com). Include the full request and response in your message to get a faster resolution.
