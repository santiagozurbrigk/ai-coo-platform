---
title: "Common Workflows"
source: "https://commasdocs.com/#common-workflows"
seccion: "Herramientas y referencia"
ancla: "#common-workflows"
capturado: "2026-08-30"
---

# Common Workflows

Step-by-step guides for the most common seller scenarios. Each workflow shows the exact API calls in order, so you can go from zero to production fast.

Workflow 1: One-Time Payment

💳

Collect a One-Time Payment

Sell a product, ticket, or digital download with a single checkout

1

Create a Checkout Session

Pass your product details, price, and a

`success_url`

where the buyer lands after payment.

POST /public-api/checkout-sessions

2

Redirect the Buyer

Use the

`payment_link`

from the response to send your buyer to the Commas-hosted payment page.

3

Listen for the Webhook

Your server receives a

`payment.succeeded`

event confirming the charge. Verify the signature, then fulfill the order.

Webhook: payment.succeeded

4

Deliver the Product

Grant access, send a download link, or ship the item. The transaction is complete and funds are on the way to your balance.

Workflow 2: Recurring Subscription

🔄

Set Up a Recurring Subscription

Bill customers weekly, monthly, or yearly — automatically

1

Define Your Product and Billing Cycle

No dashboard setup or pre-existing product is needed — product details go inline in the request. Pick your recurring price (

`amount_cents`

) and a billing cycle in days (e.g.

`7`

weekly,

`30`

monthly,

`365`

yearly).

2

Create a Checkout Session

Pass

`product.title`

,

`amount_cents`

,

`type: "subscription"`

, and

`subscription.frequency_days`

. The buyer will see the recurring terms on the checkout page.

POST /public-api/checkout-sessions

3

Handle Subscription Events

Listen for

`subscription.created`

to activate access,

`subscription.renewed`

for renewals,

`subscription.past_due`

to pause access when a renewal fails, and

`subscription.recovered`

to restore it.

Webhook: subscription.created

4

Manage the Subscription

Use the API to cancel, extend, or look up subscriber status anytime. Subscribers can also be managed from the dashboard.

DELETE /public-api/checkout-sessions/:checkoutSessionId/subscriptions/:subscriptionId

Workflow 3: Discount Campaign

🏷️

Run a Discount Campaign

Create promo codes for launches, seasonal sales, or influencer partnerships

1

Create a Discount Code

Send

`discount_type`

(

`percentage`

or

`cash`

),

`value`

,

`duration`

, and the

`service_ids`

of the products it applies to. Optional limits: max uses (

`usable_number`

) and an expiration date (

`expiry`

).

POST /public-api/discount-codes

2

Share the Code

Distribute via email, social media, or embed it directly in your checkout URL as a query parameter. Buyers enter it at checkout.

3

Track Usage

Pull code stats via the API to see how many times it's been redeemed. Update the code or delete it when the campaign is over.

GET /public-api/discount-codes/:discountCodeId

Workflow 4: Issue a Refund

↩️

Issue a Refund

Process full or partial refunds for transactions

1

Find the Transaction

Look up the original transaction by ID or list all transactions for the customer to locate the charge.

GET /public-api/transactions/:transactionId

2

Submit the Refund

Call the refund endpoint with the transaction's ID in the path. The body must include both

`amount_cents`

(the amount to refund, in cents) and

`reason`

(3–255 characters) — an empty body returns

`400 Validation failed`

. There is no full-refund default: pass the transaction's full remaining amount to refund in full.

POST /public-api/checkout-sessions/transactions/:transactionId/refund

3

Confirm via Webhook

A

`refund.created`

event fires once the refund is processed. Update your records and notify the customer.

Webhook: refund.created

Workflow 5: Webhook Automation

⚡

Set Up Webhook Automation

Get real-time notifications for every payment, subscription, and dispute event

1

Register Your Endpoint

Deploy an HTTPS endpoint on your server and register it via the API or dashboard. Choose which events to subscribe to.

POST /public-api/webhook-subscriptions

2

Implement Signature Verification

Every webhook includes an HMAC-SHA256 signature header. Verify it matches the payload using your webhook secret to prevent spoofing.

3

Return 200 Immediately

Acknowledge the webhook fast — return HTTP 200 before doing heavy work. Queue processing asynchronously: a timeout loses the event, because failed deliveries are never retried.

4

Handle Idempotency

Duplicates are rare but possible. Store the envelope

`id`

(a UUID) and skip repeats so you never double-process a payment or refund. Note that failed deliveries are never retried — reconcile via the API.

✦ Pro tip

Combine these workflows together for powerful automations. For example, create a subscription checkout with a discount code applied, then handle renewals, cancellations, and refunds all through webhooks — fully automated, no manual work needed.
