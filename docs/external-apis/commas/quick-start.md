---
title: "Quick Start"
source: "https://commasdocs.com/start-here/quick-start"
seccion: "Empezar"
ancla: "#quick-start"
capturado: "2026-08-30"
---

# Quick Start

### What can you build?

[💳 Accept Payments Generate payment links and checkout pages for any product in seconds — no coding required on the checkout side.](#checkout-sessions)

[🔄 Manage Subscriptions Create recurring billing plans, track renewals, extend access, and cancel subscriptions programmatically.](#subscribers)

[🔔 Get Real-Time Alerts Receive instant notifications when payments succeed, subscriptions are created, or anything else changes.](#webhooks)

[👥 Manage Customers View your full customer list, see their payment history, and charge them again without a new checkout.](#customers)

[🏷️ Create Discount Codes Build and manage promotional codes — percentage or fixed discounts, expiration dates, usage limits, and more.](#discount-codes)

[📊 Track Transactions Pull detailed records of every payment — who paid, what for, your net payout after fees, and refund history.](#transactions)

[🧪 API Playground Test any endpoint right here in the docs — enter your API key, pick an endpoint, fill in the parameters, and hit Send. No terminal required.](#api-playground)

Here's the fastest path to accepting your first payment through the API. This whole flow takes about 10 minutes.

1

Get your API key

Log into your Commas dashboard and go to the

**API Keys**

section. Copy your API key. You'll use it in every request you make.

2

Create a checkout session

Make a POST request to

`https://www.fanbasis.com/public-api/checkout-sessions`

with your product name, price, and type. Commas returns a

`payment_link`

— that's your customer's payment page.

3

Share the link with your customer

Send the

`payment_link`

URL to your customer via email, SMS, or embed it as a button. When they pay, Commas handles the entire checkout experience.

4

Listen for confirmation via webhooks

Set up a webhook subscription so Commas notifies your server the moment

`payment.succeeded`

fires. React automatically — grant access, send a welcome email, update your database.

↗ Putting it all together

Say you sell a **$29/month Discord community**. Here's the complete flow:

1. **Create one checkout session** — `type: "subscription"`, `frequency_days: 30`, `amount_cents: 2900`. Commas returns a `payment_link`.

2. **Share the link** — drop it in an email campaign, embed it as a button on your landing page, or send it directly to interested buyers.

3. **Customer pays** — Commas handles the checkout form, card processing, and receipt. You don't touch any of it.

4. **Your server receives `payment.succeeded`** — verify the signature, pull the buyer's email from the payload, and call the Discord API to assign them the member role automatically.

5. **Renewals are handled for you** — every 30 days Commas rebills the subscriber and fires another `payment.succeeded`. If a renewal fails, `payment.failed` fires so you can revoke access.

No manual work, no chasing payments — the entire lifecycle runs on webhooks.

═══════════════════════════════════ ENVIRONMENTS ═══════════════════════════════════
