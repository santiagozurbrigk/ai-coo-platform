---
title: "Disputes"
source: "https://commasdocs.com/#disputes"
seccion: "Recursos"
ancla: "#disputes"
capturado: "2026-08-30"
---

# Disputes

A dispute (also called a chargeback) occurs when a customer contacts their bank to reverse a charge rather than requesting a refund from you directly. Commas will notify you when a dispute is filed, but **it is your responsibility to provide compelling evidence** through the Resolution Center. Commas then files your response with the card networks.

⚠️ Time-sensitive

Dispute response deadlines are strict and set by the card network. Respond as quickly as possible — if you miss the deadline, the dispute will automatically resolve in the customer's favor and the funds will be reversed.

### Dispute Lifecycle

Each dispute progresses through the following statuses:

| Status | Meaning |
| --- | --- |
| `needs_response` | A dispute has been filed by the customer's bank. Commas sends a `dispute.created` webhook. Submit your evidence before the `due_by` deadline. |
| `under_review` | You have submitted evidence to counter the dispute. The card network is reviewing your submission. |
| `won` | The dispute was resolved in your favor. No funds were reversed. |
| `lost` | The dispute was resolved in the customer's favor. The disputed amount (plus any chargeback fee) has been debited from your balance. |
| `lost_rdr` | Resolved against you automatically through Visa's Rapid Dispute Resolution (RDR) program — the customer is refunded per your RDR rules without a formal chargeback. |
| `warning_needs_response` | An early-warning / pre-dispute alert (e.g. an Ethoca inquiry) needs a response before it can escalate into a full chargeback. |
| `warning_closed` | The early-warning alert was resolved or closed — it did not escalate into a chargeback. |

### Responding to a Dispute

To contest a dispute, gather the relevant evidence and submit it through your Commas dashboard as quickly as possible. The type of evidence depends on the reason for the dispute:

🔒 Fraudulent Transaction

IP address and device at time of purchase, login timestamps, account activity logs, browser fingerprint, and any prior successful transactions from the same account.

📦 Product Not Received

Screenshots or logs showing successful login/access, timestamped activity (downloads, sessions, content viewed), and confirmation emails sent to the customer.

❌ Not as Described

Product description from your website at the time of purchase, screenshots of what was delivered, and any customer communication acknowledging receipt or usage.

📋 All Cases

Purchase invoice, accepted Terms of Service and Refund Policy, and any support communication showing your attempts to resolve the issue before the chargeback was filed.

✓ Evidence Tips

Submit files in PDF, JPG, or PNG format only. Label each file clearly (e.g., `Login_Log_March5.pdf`). Include timestamps with timezone. Do not submit links or URLs — only attached files are accepted by card networks.

### Dispute Webhook Events

Commas emits two webhook events for the dispute lifecycle. Subscribe to both to stay informed in real time:

| Event | When it fires |
| --- | --- |
| `dispute.created` | A dispute was filed by the customer's bank. Act immediately and submit evidence as soon as possible. |
| `dispute.updated` | The dispute's status changed — to one of `under_review`, `won`, `lost`, `lost_rdr`, or `warning_closed`. Check `data.status` to see the new state. |

ℹ How to track each stage

Both events share the same payload shape. Use the `data.status` field to determine the current stage of the dispute. See the [Dispute Events reference](#evt-dispute-created) for the full payload schema and field descriptions.

```json
{
  "id": "fe3505d5-1b32-4c04-95bf-5d5f60957b7f",
  "type": "dispute.created",
  "data": {
    "id": "gT5mN",
    "dispute_id": "dp_1Q2w3E4r5T",
    "amount": 49.00,
    "dispute_fee": 15.00,
    "total_amount": 64.00,
    "status": "needs_response",
    "reason": "fraudulent",
    "payment_intent_id": "pi_3Nc8QJ2eZvKYlo2C0xYzAbCd",
    "due_by": "2026-02-08T23:59:59Z",
    "created_at": "2026-02-01T12:00:00Z",
    "updated_at": "2026-02-01T12:00:00Z",
    "organization_id": "org_7Hj2kL9mP4Qr",
    "buyer": {
      "id": "user_9Qp3nR7yT2Wk",
      "name": "John Doe",
      "email": "buyer@example.com"
    },
    "event_type": "dispute.created"
  },
  "created_at": "2026-02-01T12:00:00Z"
}
```

ℹ Reading this payload

Amounts are in **dollars** (`amount`, `dispute_fee`, `total_amount`), the response deadline is `due_by`, the envelope `id` is a UUID for deduplication, and `data.id` is the dispute's hashid. There is **no `creator_id`** field — use `organization_id`.
