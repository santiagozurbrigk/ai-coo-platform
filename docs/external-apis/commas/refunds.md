---
title: "Refunds"
source: "https://commasdocs.com/#refunds"
seccion: "Recursos"
ancla: "#refunds"
capturado: "2026-08-30"
---

# Refunds

The Commas API allows you to issue full or partial refunds for successful payments. Refunds are processed back to the original payment method. Because Commas acts as your Merchant of Record, refund eligibility and timing may be governed by your account's agreement.

### Refund Rules

Refund eligibility is enforced mostly **downstream**, at the payment gateway — the API does very little pre-validation, so most rule violations surface as a `400` with a descriptive `message` rather than being blocked up front:

| Rule | Details |
| --- | --- |
| **Payment must be refundable** | The API does **not** pre-check the payment's status. A payment that isn't eligible (failed, still pending, already reversed) is not rejected up front — the request is forwarded to the gateway, which rejects it, and you get a `400` carrying the gateway's message. |
| **Processor refund window** | Each processor enforces its own refund window — typically 120–180 days. The API does **not** pre-validate it, so an out-of-window refund is attempted and fails at the gateway, returning `400` with the gateway's message. Contact [support@fanbasis.com](mailto:support@fanbasis.com) for off-platform options once the window has passed. |
| **No duplicate refund requests** | Refunds are synchronous. Replaying the same `Idempotency-Key` within 10 minutes returns `409` ("This refund request was already processed.") instead of refunding twice. |
| **Amount ≤ remaining refundable amount** | The cumulative refund amount across all partial refunds cannot exceed the original payment amount. Overage returns `400` with a descriptive message, e.g. `"Refund amount exceeds remaining refundable amount. Already refunded: $10.00, Remaining: $19.99"`. |
| **Not already fully refunded** | A fully refunded payment has no remaining refundable amount, so further requests fail the same way — `400` with a descriptive `message`. |

### Create a Refund

Issue a full or partial refund for a completed payment:

```http
POST /public-api/checkout-sessions/transactions/{transactionId}/refund
```

Replace `{transactionId}` with the transaction's hashid (returned by transaction endpoints) or its public order ID (`ORD-XXXX-XXXX-XXXX`, as delivered in webhook payloads) — both work.

#### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount_cents` | integer | Required | Amount to refund in cents (minimum 1). Pass the transaction's full remaining amount for a full refund. An empty body returns `400 Validation failed`. |
| `reason` | string | Required | Human-readable reason for the refund, 3–255 characters. Stored on the refund record and may appear in customer communications. |

```
POST /public-api/checkout-sessions/transactions/pX9vQ/refund
x-api-key: YOUR_API_KEY
Content-Type: application/json
Idempotency-Key: refund-req-001
 
{
  "amount_cents": 2500,
  "reason": "Customer requested partial refund for unused portion"
}
```

Response — 200 OK

```json
{
  "status": "success",
  "message": "Transaction refunded successfully",
  "data": {
    "refund_id": "d8Kw2",
    "transaction_id": "pX9vQ",
    "refund_amount": 25.00,
    "refund_amount_cents": 2500,
    "refund_type": "partial",
    "refund_cost": 26.05,
    "proportional_fee": 1.05,
    "creator_amount_deduction": 25.00
  },
  "request_id": "req_9f2c…"
}⎘ Copy
```

### Refunds Are Synchronous

There is no refund status lifecycle to poll. Refunds are processed synchronously: if the API returns `200`, the refund has been issued — the response body already contains the final amounts (`refund_amount`, `refund_cost`, `proportional_fee`, `creator_amount_deduction`). If the refund cannot be processed (payment disputed, insufficient wallet balance, or a bank issue), the request fails with an error response instead. Contact [support@fanbasis.com](mailto:support@fanbasis.com) if you need help with a failed refund.

⚠ Bank/ACH payments cannot be refunded until they settle

ACH and bank-transfer payments complete asynchronously — a charge can report success while still in progress. Refunding one before it settles fails with `Failed to refund transaction`, which does not say that waiting is the fix. Check the payment with [Get a Transaction](#txn-get) and retry the refund once it has completed. Card payments are not affected.

ℹ️ Webhook Notifications

Subscribe to the `refund.created` webhook event to be notified whenever a refund is issued — including refunds triggered from the dashboard, not just via the API. See the [refund.created event reference](#evt-refund-created) for the full payload schema.
