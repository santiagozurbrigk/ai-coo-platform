---
title: "Examples"
source: "https://commasdocs.com/#sdk-examples"
seccion: "SDK de checkout"
ancla: "#sdk-examples"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Examples

⚠ Every example below is the full minimum viable code

Each example is a complete, copy-pasteable file that includes the **five base requirements** for a working embedded checkout. If you strip any of these out, you'll hit one of the known failure modes (stuck on processing, invisible errors, dead handlers):

1. SDK script loaded from `cdn.embedded.fanbasis.io/embed/index.js`

2. A mount target `<div id="checkout-container"></div>`

3. `redirectSettings` with **`always_redirect: true`** — without this the iframe gets stuck on "processing" after a successful payment

4. All three event handlers registered **before** `init()`: `checkout:success` (fallback redirect), `checkout:error` (integration errors), `form:submission_error` (gateway/card errors shown to the buyer)

5. `attachToElement()` → register events → `init()`, in that order

For the canonical CSS + error-banner template, see [Quick Start — Battle-tested template](#sdk-quick-start-js). Each example below uses the same pattern.

Pick an example

🛒 Buy-Now button → modal overlay

📊 Multiple products on one page (pricing table)

🔄 Plan selector — switch between subscriptions (React)

⚡ Dynamic product creation — create on the fly

### Buy-Now button → modal overlay

Classic "Buy Now" pattern: a button on a marketing page opens an overlay containing the embedded checkout. The SDK instance is created on first click and torn down on close so revisits start clean.

```js
<style>
  #buy-now-btn {
    padding: 14px 28px; background: #007BFF; color: #fff;
    border: none; border-radius: 8px; font-size: 16px;
    font-weight: 600; cursor: pointer;
  }
  #checkout-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.55); z-index: 9999;
    align-items: center; justify-content: center;
  }
  #checkout-overlay.open { display: flex; }
  #checkout-modal {
    background: #fff; border-radius: 16px;
    width: 92%; max-width: 720px; max-height: 92vh;
    overflow-y: auto; position: relative; padding: 24px;
  }
  #modal-close {
    position: absolute; top: 14px; right: 14px;
    background: none; border: none; font-size: 24px;
    cursor: pointer; color: #555;
  }
  #checkout-container { width: 100%; min-height: 800px; }
  #checkout-container iframe { width: 100% !important; min-height: 800px !important; border-radius: 12px; }
  .fb-err { background:#fee2e2;border:1px solid #ef4444;padding:12px 16px;border-radius:8px;margin-bottom:16px;color:#991b1b;font-size:14px; }
</style>
 
<button id="buy-now-btn">Buy Now — $49</button>
 
<div id="checkout-overlay">
  <div id="checkout-modal">
    <button id="modal-close" aria-label="Close">×</button>
    <div id="error-banner-slot"></div>
    <div id="checkout-container"></div>
  </div>
</div>
 
<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
<script>
var checkout = null;
var overlay = document.getElementById('checkout-overlay');
 
document.getElementById('buy-now-btn').addEventListener('click', openCheckout);
document.getElementById('modal-close').addEventListener('click', closeCheckout);
overlay.addEventListener('click', function(e) { if (e.target === overlay) closeCheckout(); });
 
function showError(msg) {
  document.getElementById('error-banner-slot').innerHTML =
    '<div class="fb-err">⚠ ' + msg + '</div>';
}
 
function openCheckout() {
  overlay.classList.add('open');
  if (checkout) return;   // already initialized; reusing same instance
 
  checkout = PaymentCheckout.create({
    creatorId: 'REPLACE_CREATOR_SLUG',
    productId: 'REPLACE_PRODUCT_ID',
    checkoutSessionSecret: 'REPLACE_SESSION_SECRET',
    environment: 'production',
    redirectSettings: {
      success_redirect_url: 'https://yoursite.com/thank-you',
      always_redirect: true
    },
    theme: { theme: 'light', accent_color: '#007BFF', show_product_info: true, product_layout: 'left', show_coupon_row: true }
  });
 
  checkout.attachToElement(document.getElementById('checkout-container'));
 
  checkout.on('checkout:success', function(data) {
    window.location.href = 'https://yoursite.com/thank-you?tx=' + data.transactionId;
  });
  checkout.on('checkout:error', function(err) {
    showError((err && err.message) || 'Something went wrong. Please try again.');
  });
  checkout.on('form:submission_error', function(d) {
    showError((d && d.data && d.data.errorMessage) || 'Payment failed. Please check your details.');
  });
 
  checkout.init();
}
 
function closeCheckout() {
  overlay.classList.remove('open');
  // Optional: fully destroy on close so the next open re-fetches a fresh session.
  // if (checkout) { try { checkout.destroy(); } catch (e) {} checkout = null; }
}
</script>
```

### Multiple products on one page (pricing table)

Render several checkout iframes side-by-side — e.g. a pricing tier comparison. **Each product needs its own session secret**; you cannot share a single secret across multiple checkouts. Fetch one per product from your backend.

```js
<style>
  .tier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
  @media (max-width: 1000px) { .tier-grid { grid-template-columns: 1fr; } }
  .tier { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
  .tier h3 { font-size: 18px; margin-bottom: 6px; }
  .tier .price { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
  .tier .mount { min-height: 900px; }
  .tier .mount iframe { width: 100% !important; min-height: 900px !important; border-radius: 10px; }
  .tier .err { background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:6px;margin-bottom:12px;font-size:13px;display:none; }
</style>
 
<div class="tier-grid">
  <div class="tier">
    <h3>Basic</h3><p class="price">$9.99 / mo</p>
    <div class="err" id="err-basic"></div>
    <div class="mount" id="mount-basic"></div>
  </div>
  <div class="tier">
    <h3>Pro</h3><p class="price">$29.99 / mo</p>
    <div class="err" id="err-pro"></div>
    <div class="mount" id="mount-pro"></div>
  </div>
  <div class="tier">
    <h3>Enterprise</h3><p class="price">$99.99 / mo</p>
    <div class="err" id="err-enterprise"></div>
    <div class="mount" id="mount-enterprise"></div>
  </div>
</div>
 
<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
<script>
var TIERS = [
  { id: 'basic',      productId: 'REPLACE_BASIC_PRODUCT_ID',      mount: 'mount-basic',      errSlot: 'err-basic' },
  { id: 'pro',        productId: 'REPLACE_PRO_PRODUCT_ID',        mount: 'mount-pro',        errSlot: 'err-pro' },
  { id: 'enterprise', productId: 'REPLACE_ENTERPRISE_PRODUCT_ID', mount: 'mount-enterprise', errSlot: 'err-enterprise' }
];
 
document.addEventListener('DOMContentLoaded', function() {
  TIERS.forEach(initTier);
});
 
async function initTier(tier) {
  function showError(msg) {
    var el = document.getElementById(tier.errSlot);
    el.textContent = '⚠ ' + msg;
    el.style.display = 'block';
  }
 
  try {
    // Fetch a session secret for THIS product from your backend.
    // Your backend should call POST /public-api/checkout-sessions/embedded
    // and return { checkoutSessionSecret } — never expose your API key client-side.
    var res = await fetch('/api/embedded-session?productId=' + tier.productId);
    if (!res.ok) throw new Error('session fetch failed');
    var sessionSecret = (await res.json()).checkoutSessionSecret;
 
    var checkout = PaymentCheckout.create({
      creatorId: 'REPLACE_CREATOR_SLUG',
      productId: tier.productId,
      checkoutSessionSecret: sessionSecret,
      environment: 'production',
      redirectSettings: {
        success_redirect_url: 'https://yoursite.com/thank-you?plan=' + tier.id,
        always_redirect: true
      },
      theme: { theme: 'light', accent_color: '#007BFF', show_product_info: true, product_layout: 'left', show_coupon_row: false }
    });
 
    checkout.attachToElement(document.getElementById(tier.mount));
 
    checkout.on('checkout:success', function(data) {
      window.location.href = 'https://yoursite.com/thank-you?plan=' + tier.id + '&tx=' + data.transactionId;
    });
    checkout.on('checkout:error', function(err) {
      showError((err && err.message) || 'Could not load checkout.');
    });
    checkout.on('form:submission_error', function(d) {
      showError((d && d.data && d.data.errorMessage) || 'Payment failed.');
    });
 
    checkout.init();
  } catch (err) {
    showError(err.message || 'Failed to initialize.');
  }
}
</script>
```

### Plan selector — switch between subscriptions (React)

Render one checkout that re-mounts with a different `productId` when the buyer picks a different plan. Uses the React SDK's `CheckoutProvider` + `AutoCheckout` with a per-plan session fetched from the backend.

```js
import { useState, useEffect } from 'react';
import {
  CheckoutProvider, AutoCheckout, useCheckoutContext
} from '@fanbasis/checkout-react';
 
const PLANS = [
  { id: 'basic',      productId: 'REPLACE_BASIC_PRODUCT_ID',      label: 'Basic',      price: '$9.99/mo' },
  { id: 'pro',        productId: 'REPLACE_PRO_PRODUCT_ID',        label: 'Pro',        price: '$29.99/mo' },
  { id: 'enterprise', productId: 'REPLACE_ENTERPRISE_PRODUCT_ID', label: 'Enterprise', price: '$99.99/mo' }
];
 
export function PlanSelector() {
  const [plan, setPlan] = useState(PLANS[1]);    // default to Pro
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  // Fetch a fresh session secret whenever the plan changes
  useEffect(() => {
    setSecret(null);
    setError(null);
    fetch(`/api/embedded-session?productId=${plan.productId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Session fetch failed')))
      .then(d => setSecret(d.checkoutSessionSecret))
      .catch(e => setError(e.message));
  }, [plan.productId]);
 
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {PLANS.map(p => (
          <button
            key={p.id}
            onClick={() => setPlan(p)}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: 8,
              border: p.id === plan.id ? '2px solid #007BFF' : '1px solid #e5e7eb',
              background: p.id === plan.id ? '#eff6ff' : '#fff',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            {p.label} — {p.price}
          </button>
        ))}
      </div>
 
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}
 
      {secret && (
        <CheckoutProvider
          key={plan.id}   /* re-mount when plan changes */
          config={{
            creatorId: 'REPLACE_CREATOR_SLUG',
            productId: plan.productId,
            checkoutSessionSecret: secret,
            environment: 'production',
            redirectSettings: {
              success_redirect_url: `https://yoursite.com/thank-you?plan=${plan.id}`,
              always_redirect: true
            },
            theme: { theme: 'light', accent_color: '#007BFF', show_product_info: true, product_layout: 'left', show_coupon_row: false }
          }}
        >
          <CheckoutEvents onError={setError} />
          <AutoCheckout autoInit />
        </CheckoutProvider>
      )}
    </div>
  );
}
 
// Helper component to wire all 3 required event handlers
function CheckoutEvents({ onError }: { onError: (msg: string) => void }) {
  const { checkout } = useCheckoutContext();
 
  useEffect(() => {
    if (!checkout) return;
    const onSuccess = (data: any) => { window.location.href = `https://yoursite.com/thank-you?tx=${data.transactionId}`; };
    const onCheckoutError = (err: any) => onError((err && err.message) || 'Something went wrong.');
    const onSubmissionError = (d: any) => onError((d && d.data && d.data.errorMessage) || 'Payment failed.');
 
    checkout.on('checkout:success', onSuccess);
    checkout.on('checkout:error', onCheckoutError);
    checkout.on('form:submission_error', onSubmissionError);
 
    return () => {
      checkout.off('checkout:success', onSuccess);
      checkout.off('checkout:error', onCheckoutError);
      checkout.off('form:submission_error', onSubmissionError);
    };
  }, [checkout, onError]);
 
  return null;
}
```

### Dynamic product creation — create product + session on the fly

"Name your price" / one-off bookings / custom invoices: the product doesn't exist before the buyer clicks. Your backend creates it on demand, returns a fresh session, and the frontend mounts the embed. Useful for coaching sessions, custom quotes, donation amounts, etc.

```js
<style>
  .form-row { margin-bottom: 14px; }
  .form-row label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 4px; }
  .form-row input, .form-row textarea { width: 100%; padding: 8px 12px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 14px; }
  #load-btn { padding: 12px 24px; background: #007BFF; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
  #load-btn:disabled { background: #999; cursor: not-allowed; }
  #checkout-container { width: 100%; min-height: 800px; margin-top: 24px; display: none; }
  #checkout-container iframe { width: 100% !important; min-height: 800px !important; border-radius: 12px; }
  .err { background:#fee2e2;color:#991b1b;padding:12px 16px;border-radius:8px;margin:12px 0;display:none; }
</style>
 
<div style="max-width: 760px; margin: 0 auto; padding: 40px 20px;">
  <h1>Book a Coaching Call</h1>
  <div class="form-row"><label>Topic</label><input id="title" placeholder="What do you want to discuss?" /></div>
  <div class="form-row"><label>Price (USD)</label><input id="amount" type="number" min="0.50" step="0.01" placeholder="49.99" /></div>
  <button id="load-btn">Continue to Payment</button>
 
  <div class="err" id="err"></div>
  <div id="checkout-container"></div>
</div>
 
<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
<script>
var checkout = null;
document.getElementById('load-btn').addEventListener('click', loadCheckout);
 
function showError(msg) {
  var el = document.getElementById('err');
  el.textContent = '⚠ ' + msg;
  el.style.display = 'block';
}
 
async function loadCheckout() {
  var btn = document.getElementById('load-btn');
  var title = document.getElementById('title').value.trim();
  var amount = parseFloat(document.getElementById('amount').value);
 
  if (!title) return showError('Please enter a topic.');
  if (!amount || amount < 0.50) return showError('Price must be at least $0.50.');
 
  // Tear down previous checkout if any
  if (checkout) { try { checkout.destroy(); } catch (e) {} checkout = null; }
 
  btn.disabled = true;
  document.getElementById('err').style.display = 'none';
 
  try {
    // Backend creates the product + checkout session and returns everything we need
    var res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title, amount_cents: Math.round(amount * 100) })
    });
    if (!res.ok) {
      var errBody = await res.json().catch(function() { return {}; });
      throw new Error(errBody.error || ('Server error: ' + res.status));
    }
    var data = await res.json();
 
    var container = document.getElementById('checkout-container');
    container.style.display = 'block';
 
    checkout = PaymentCheckout.create({
      creatorId: data.creatorId,
      productId: data.productId,
      checkoutSessionSecret: data.checkoutSessionSecret,
      environment: 'production',
      redirectSettings: {
        success_redirect_url: 'https://yoursite.com/thank-you',
        always_redirect: true
      },
      theme: { theme: 'light', accent_color: '#007BFF', show_product_info: true, product_layout: 'left', show_coupon_row: false }
    });
 
    checkout.attachToElement(container);
 
    checkout.on('checkout:success', function(d) {
      window.location.href = 'https://yoursite.com/thank-you?tx=' + d.transactionId;
    });
    checkout.on('checkout:error', function(err) {
      showError((err && err.message) || 'Could not load checkout.');
    });
    checkout.on('form:submission_error', function(d) {
      showError((d && d.data && d.data.errorMessage) || 'Payment failed.');
    });
 
    checkout.init();
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
  }
}
</script>
```

Backend pairing (Node / Express) that the frontend above calls:

```js
// Required env vars (NEVER expose these to the browser):
//   FANBASIS_API_KEY      = your secret API key from the dashboard
//   FANBASIS_CREATOR_ID   = your creator slug
 
const express = require('express');
const app = express();
app.use(express.json());
 
const FANBASIS_API = 'https://www.fanbasis.com/public-api';
 
async function fb(method, path, body) {
  const res = await fetch(`${FANBASIS_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.FANBASIS_API_KEY
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Commas API ${res.status}`);
  return data;
}
 
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { title, amount_cents } = req.body;
    if (!title || !amount_cents) {
      return res.status(400).json({ error: 'title and amount_cents required' });
    }
 
    // 1. Create a checkout session (this also creates the underlying product)
    const session = await fb('POST', '/checkout-sessions', {
      product: { title },
      amount_cents,
      type: 'onetime_reusable'
    });
 
    // 2. Create an embedded session secret tied to this creator
    const embed = await fb('POST', '/checkout-sessions/embedded', {
      creatorId: process.env.FANBASIS_CREATOR_ID
    });
 
    // 3. Fetch the session to get the product ID (for the SDK config)
    const details = await fb('GET', `/checkout-sessions/${session.data.checkout_session_id}`);
 
    res.json({
      creatorId: process.env.FANBASIS_CREATOR_ID,
      productId: details.data.product.id,
      checkoutSessionSecret: embed.data.checkout_session_secret
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
app.listen(3000);
```

✓ Common variations

- **Subscription:** pass `type: 'subscription'` plus `subscription: { frequency_days: 30 }` in the `/checkout-sessions` POST body.
- **Per-buyer metadata:** add `metadata: { source: 'landing-page', utm: '...' }` to the SDK config — it's stored on the transaction and surfaced in `checkout:success.metadata` and webhook payloads.
- **Webhooks for fulfillment:** pass a `webhook_url` on the `/checkout-sessions` POST body so your backend gets notified server-side too — don't rely on `checkout:success` alone for fulfillment.
