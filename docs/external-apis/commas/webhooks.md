---
title: "Webhooks"
source: "https://commasdocs.com/api/webhooks"
seccion: "Webhooks"
ancla: "#webhooks"
capturado: "2026-08-30"
---

# Webhooks

Webhooks are the bridge between Commas and your application. Instead of constantly asking "did something happen?", your server just listens and Commas calls it automatically whenever an event occurs — like a payment coming in or a subscription being canceled.

⬡ How webhooks work

You give Commas a URL on your server (e.g., `https://yoursite.com/webhooks`). When an event happens, Commas makes an HTTP POST to that URL with a JSON payload describing the event. Your server reads the payload, verifies it's genuine using your secret key, and takes action.

### Common Webhook Use Cases

| When this event fires… | You might want to… |
| --- | --- |
| `payment.succeeded` | Grant access, send a welcome email, update your database, generate a receipt. |
| `payment.failed` | Email the customer, flag the account, or retry the charge later. |
| `subscription.created` | Create an account for the customer in your system, assign roles or permissions. |
| `subscription.renewed` | Log the renewal, extend access dates in your database. |
| `subscription.canceled` | Revoke access, downgrade the account, trigger a re-engagement campaign. |
| `product.purchased` | Fulfill the order, email a download link, or unlock digital content. |
| `refund.created` | Revoke access, update your records, account for the non-refundable processing fee. |
| `dispute.created` | Alert your team immediately and begin gathering transaction evidence. |
| `dispute.updated` | Check `data.status` — if `won`, restore access; if `lost`, deduct the amount and fee from your records. |

### All Event Types

| Event | What it means |
| --- | --- |
| `payment.succeeded` | A payment was successfully processed and funds are on their way to you. |
| `payment.failed` | A payment attempt was declined or failed. |
| `payment.expired` | A checkout session expired before the customer completed payment. |
| `payment.canceled` | A payment was canceled before it was completed. |
| `product.purchased` | A customer completed a one-time product purchase. |
| `subscription.created` | A customer started a new subscription. |
| `subscription.renewed` | A subscription successfully billed for a new period. |
| `subscription.completed` | A subscription ran through all its billing periods and ended. |
| `subscription.canceled` | A subscription was canceled — either by you or by the customer. |
| `subscription.past_due` | A renewal charge failed and the subscription entered the automatic retry window. |
| `subscription.recovered` | A past-due subscription was successfully charged and is active again. |
| `refund.created` | A refund was issued to a customer. |
| `dispute.created` | A chargeback was filed by the customer's bank. |
| `dispute.updated` | A dispute's status changed (e.g., `won`, `lost`, `under_review`). |

### Webhook Subscription Endpoints

Use these endpoints to manage which URLs receive your events and which event types they listen for.

List Webhooks

## List Your Webhook Subscriptions

```http
GET /public-api/webhook-subscriptions
```

Shows all webhook endpoints you've registered, what events they're listening for, and whether they're active.

```shell
curl https://www.fanbasis.com/public-api/webhook-subscriptions \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/webhook-subscriptions",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/webhook-subscriptions", {
  method: "GET",
  headers: {
    "x-api-key": "YOUR_API_KEY",
  },
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/webhook-subscriptions",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
  ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

GET

/public-api/webhook-subscriptions

API Key

Request

```bash
curl https://www.fanbasis.com/public-api/webhook-subscriptions \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Webhook subscriptions retrieved successfully",
  "data": [
    {
      "id": "184",
      "user_id": null,
      "organization_id": 42,
      "organization_uuid": "0e6c1b9a-4f2d-4c8e-9b1a-7d3e5f2a8c01",
      "webhook_url": "https://yoursite.com/webhooks",
      "event_types": ["payment.succeeded", "subscription.created"],
      "is_active": true,
      "last_used_at": "2026-07-10T08: 15: 00+00: 00",
      "created_at": "2026-07-01T00: 00: 00+00: 00",
      "updated_at": "2026-07-10T08: 15: 00+00: 00"
    }
  ],
  "request_id": "…"
}⎘ Copy
```

Subscription IDs are plain numeric strings (e.g. `"184"`). `user_id` is a legacy field and is always `null` — don't rely on it. `last_used_at` is the timestamp of the most recent delivery to your URL, or `null` if no event has been sent yet.

Create Webhook

## Create a Webhook Subscription

```http
POST /public-api/webhook-subscriptions
```

Registers a new URL to receive webhook events. You choose which events to subscribe to. The response includes a `secret_key` — use it to verify that incoming requests are genuinely from Commas.

⚠ Treat your secret key like a password

Store the `secret_key` securely (e.g., as an environment variable) and never commit it to source control or log it. You'll use it to validate the signature of every incoming webhook request.

Request Body

```json
{
  "webhook_url": "https://yoursite.com/webhooks/fanbasis",
  "event_types": [
    "payment.succeeded",
    "payment.failed",
    "subscription.created",
    "subscription.canceled"
  ]
}
```

```shell
curl -X POST https://www.fanbasis.com/public-api/webhook-subscriptions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": ["payment.succeeded", "subscription.created", "subscription.canceled"]
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": [
        "payment.succeeded",
        "subscription.created",
        "subscription.canceled"
    ]
}

response = requests.post(
    "https://www.fanbasis.com/public-api/webhook-subscriptions",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/webhook-subscriptions", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": [
      "payment.succeeded",
      "subscription.created",
      "subscription.canceled"
    ]
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/webhook-subscriptions",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": ["payment.succeeded", "subscription.created", "subscription.canceled"]
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/webhook-subscriptions

API Key

Request Body

Request

```bash
curl -X POST https://www.fanbasis.com/public-api/webhook-subscriptions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": ["payment.succeeded", "subscription.created", "subscription.canceled"]
  }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Webhook subscription created successfully",
  "data": {
    "id": "184",
    "user_id": null,
    "organization_id": 42,
    "organization_uuid": "0e6c1b9a-4f2d-4c8e-9b1a-7d3e5f2a8c01",
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": ["payment.succeeded", "subscription.created", "subscription.canceled"],
    "is_active": true,
    "secret_key": "whsk_9f2c4e6a8b0d…64 hexadecimal characters",
    "last_used_at": null,
    "created_at": "2026-07-13T10: 00: 00+00: 00",
    "updated_at": "2026-07-13T10: 00: 00+00: 00"
  },
  "request_id": "…"
}⎘ Copy
```

Delete Webhook

## Delete a Webhook Subscription

```http
DELETE /public-api/webhook-subscriptions/:webhookSubscriptionId
```

Removes a webhook subscription. Commas will immediately stop sending events to that URL.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `webhookSubscriptionId` | string | Required | The ID of the webhook subscription to remove. |

```shell
curl -X DELETE "https://www.fanbasis.com/public-api/webhook-subscriptions/184" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.delete(
    "https://www.fanbasis.com/public-api/webhook-subscriptions/184",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/webhook-subscriptions/184", {
  method: "DELETE",
  headers: {
    "x-api-key": "YOUR_API_KEY",
  },
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/webhook-subscriptions/184",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "DELETE",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
  ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

DELETE

/public-api/webhook-subscriptions/184

API Key

Request

```bash
curl -X DELETE "https://www.fanbasis.com/public-api/webhook-subscriptions/184" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Webhook subscription deleted successfully",
  "data": []
}⎘ Copy
```

Test Webhook

## Test a Webhook Subscription

```http
POST /public-api/webhook-subscriptions/:webhookSubscriptionId/test
```

Sends a simulated event to your webhook URL so you can verify everything is working before going live. Great for testing your server's response logic without needing a real payment.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `webhookSubscriptionId` | string | Required | The ID of the webhook subscription to test. |

Request Body

```json
{
  "event_type": "payment.succeeded"
}
```

```shell
curl -X POST "https://www.fanbasis.com/public-api/webhook-subscriptions/184/test" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "event_type": "payment.succeeded" }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "event_type": "payment.succeeded"
}

response = requests.post(
    "https://www.fanbasis.com/public-api/webhook-subscriptions/184/test",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/webhook-subscriptions/184/test", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "event_type": "payment.succeeded"
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/webhook-subscriptions/184/test",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{ "event_type": "payment.succeeded" }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/webhook-subscriptions/184/test

API Key

Request Body

Request

```bash
curl -X POST "https://www.fanbasis.com/public-api/webhook-subscriptions/184/test" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "event_type": "payment.succeeded" }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Test event sent successfully",
  "data": {
    "event_sent": true,
    "response_status": 200,
    "response_body": "OK"
  }
}⎘ Copy
```

You can test most subscribed event types, including `refund.created`, `dispute.created`, and `dispute.updated`.

⚠ Three event types cannot be tested

`product.purchased`, `subscription.past_due`, and `subscription.recovered` have no test payload implemented — asking for them returns `500` even when your subscription is subscribed to them.

ℹ Test payloads are flat, real ones are enveloped

For `payment.succeeded` and the core `subscription.*` events, the test endpoint sends a **flat** payload with no `{id, type, data, created_at}` envelope, whereas every real delivery is enveloped. Don't validate your parser against test events alone.

### Error Responses

| Status | When |
| --- | --- |
| `400` | The `event_type` in the body is not one this subscription is subscribed to ("Event type not subscribed to"). |
| `500` | Your endpoint could not be reached or the delivery failed. |

WEBHOOK SECURITY & BEST PRACTICES

---

### Webhook Security & Best Practices

Once you start receiving real payment events, these practices will save you from subtle, hard-to-debug issues:

⚠ Validate every incoming webhook

Anyone on the internet can POST to your webhook URL. Always verify that the request actually came from Commas. Each webhook includes a signature header — compare it against a hash of the request body using your webhook secret before trusting the payload.

✦ Return 200 immediately — process async

Commas expects your endpoint to respond with HTTP `200` within a few seconds. If your logic takes longer (e.g., sending emails, updating a database), respond with 200 first and process the work asynchronously in a background job. A slow handler that times out loses the event outright — delivery is at-most-once and nothing is redelivered.

⚠ Delivery is at-most-once — there are no retries

A delivery that fails (non-2xx response, timeout, or unreachable host) is logged and **never retried**. There is no backoff schedule and no redelivery queue, so a webhook your server drops is gone. Reconcile against the API instead of waiting for a retry — e.g. `GET /public-api/checkout-sessions/transactions` for payments.

ℹ Handle duplicate events gracefully

Duplicates are rare but still possible, so make your webhook handler **idempotent** (meaning: receiving the same event twice has the same effect as receiving it once — no double-charging, no duplicate emails). Dedupe on the envelope `id` — a UUID unique to each event — before taking action a second time.

● Troubleshooting webhook issues

**Events not arriving?** Make sure your webhook URL is publicly accessible (not `localhost`), your server returns HTTP 200, and no firewall rules are blocking Commas's requests. Use the Test Webhook endpoint to verify connectivity before going live. **Signature mismatch?** Double-check that you're using the webhook secret for the correct subscription and that you're hashing the raw request body — not a re-serialized JSON string.

─────────────── SIGNATURE VALIDATION ───────────────

### 🔐 Signature Validation

All webhook requests are signed using **HMAC-SHA256** to guarantee payload authenticity. The signature is sent in the `x-webhook-signature` header, computed from your webhook secret key and the raw request body. Always validate this before processing any event.

⚠ Always use the raw request body

Never re-serialize the parsed JSON to generate or compare signatures — JSON serializers can reorder keys or alter whitespace, causing a mismatch even on legitimate requests. Read the raw bytes exactly as received off the wire.

#### How validation works

1. Capture the **raw request body** before any parsing

2. Read the signature from the `x-webhook-signature` header

3. Compute `HMAC-SHA256(raw_body, your_secret)` and hex-encode it

4. Compare using a **constant-time comparison** to prevent timing attacks

5. Reject with `401 Unauthorized` if signatures do not match

Language Tab Switcher

PHP

```
// Validate Commas webhook signature in PHP
$payload   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$secret    = 'your_webhook_secret_key';
 
$expected = hash_hmac('sha256', $payload, $secret);
 
if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}
 
// Safe to process the event
$event = json_decode($payload, true);
error_log('Received event: ' . $event['type']);
```

Node.js

```js
const crypto = require('crypto');
 
function validateWebhookSignature(rawBody, signatureHeader, secret) {
  // Always use the raw body buffer -- never re-serialized JSON
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
 
  const expectedBuf = Buffer.from(expected, 'hex');
  const signatureBuf = Buffer.from(signatureHeader || '', 'hex');
  // A wrong-length or malformed header must fail validation, not throw
  if (signatureBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(signatureBuf, expectedBuf);
}
 
// Express handler -- use express.raw() to preserve the raw body
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-webhook-signature'];
  if (!sig || !validateWebhookSignature(req.body, sig, 'your_webhook_secret_key')) {
    return res.status(401).send('Invalid signature');
  }
 
  const event = JSON.parse(req.body);
  console.log('Received:', event.type);
  res.sendStatus(200);
});
```

Python

```js
import hmac
import hashlib
from flask import Flask, request, abort
 
app = Flask(__name__)
 
def validate_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(expected, signature)
 
@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('x-webhook-signature')
    if not signature:
        abort(401, 'Missing signature')
 
    if not validate_signature(
        request.get_data(),          # raw bytes, not parsed JSON
        signature,
        'your_webhook_secret_key'
    ):
        abort(401, 'Invalid signature')
 
    event = request.get_json()
    print(f"Received: {event['type']}")
    return '', 200
```

Ruby

```
require 'openssl'
 
class WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token
 
  def create
    signature = request.headers['x-webhook-signature']
    return head :unauthorized unless signature
 
    unless valid_signature?(request.raw_post, signature, 'your_webhook_secret_key')
      return head :unauthorized
    end
 
    event = JSON.parse(request.raw_post)
    Rails.logger.info "Received: #{event['type']}"
    head :ok
  end
 
  private
 
  def valid_signature?(payload, signature, secret)
    expected = OpenSSL::HMAC.hexdigest('sha256', secret, payload)
    # Constant-time comparison prevents timing attacks
    ActiveSupport::SecurityUtils.secure_compare(expected, signature)
  end
end
```

/sig-tabs

Best Practices Grid

#### Security best practices

✦ Use constant-time comparison

Standard string equality short-circuits on the first differing byte, leaking timing information. Use `hash_equals` / `timingSafeEqual` / `hmac.compare_digest` instead.

⚠ Guard your secret key

Store it in an environment variable or secrets manager — never hard-code it or commit it to source control. Rotate immediately if it is ever exposed.

ℹ Log failed validations

A spike in signature failures could indicate someone probing your endpoint. Log the source IP and timestamp for every rejected request.

● Return 401, not 400

Use `HTTP 401 Unauthorized` for signature failures — this signals an authentication problem, not a bad request, making it easier to triage in logs and monitoring.

/signature-validation
