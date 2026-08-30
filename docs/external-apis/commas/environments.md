---
title: "Environments"
source: "https://commasdocs.com/#environments"
seccion: "Empezar"
ancla: "#environments"
capturado: "2026-08-30"
---

# Environments

Commas gives you two environments: one for live payments, and one for testing. Both work identically — the only difference is which API key you use.

🟢 Production

Use your live API key. Real charges will be made to real cards.

**Base URL:**

`https://www.fanbasis.com`

🔵 Sandbox (Test Mode)

Use your test API key. No real charges. Safe to experiment freely.

**Base URL:**

`https://qa.dev-fan-basis.com`

ℹ "Sandbox", "test mode", and "QA" all mean the same thing

The test environment is hosted at `https://qa.dev-fan-basis.com` — you'll sometimes see it labeled "QA" (it's the same host). If you use the **Embedded Checkout SDK**, note that the SDK's `environment` value for this is the string `'sandbox'` (never `'qa'`), even though the host URL contains "qa".

⚠ Keys are per-environment — and the active environment is shared

Each environment needs its own API key registered against your account — a production key will not work in sandbox, and vice versa. Create and copy keys in your dashboard under **Account → API Keys** (CLI: `commas keys add sandbox`). Your environment selection is also persisted **server-side, per API key**, and shared by every client using your account — switching to sandbox in the CLI or an AI agent moves your other clients too, until one of them switches back. Switching always requires a key registered for the target environment.

### Test Card Numbers

Use these card numbers in sandbox mode to simulate different payment scenarios. These are standard test card numbers accepted by our payment processor — they do not charge real cards.

ℹ Sandbox cards only

These numbers work exclusively in sandbox mode. Using them in production will result in a payment failure. Always use your **sandbox API key** when testing.

| Card Brand | Card Number | Expiry | CVV |
| --- | --- | --- | --- |
| Visa | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| Mastercard | `5555 5555 5555 4444` | Any future date | Any 3 digits |
| Amex | `3782 822463 10005` | Any future date | Any 4 digits |
| Discover | `6011 1111 1111 1117` | Any future date | Any 3 digits |

═══════════════════════════════════ API POLICY ═══════════════════════════════════
