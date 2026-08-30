---
title: "Quick Start — Hosted JS"
source: "https://commasdocs.com/#sdk-quick-start-js"
seccion: "SDK de checkout"
ancla: "#sdk-quick-start-js"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Quick Start — Hosted JS

The fastest path. Include a script tag and start accepting payments in minutes.

### 1. Include the script

```
<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
```

This exposes the global `PaymentCheckout` object.

### 2. Initialize checkout

There are three initialization methods. All produce the same result.

#### Method A · JavaScript config · Recommended

Most flexible. Works everywhere — page builders, custom HTML, any website.

```js
<div id="checkout-container"></div>
<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async function () {
  var element = document.getElementById('checkout-container');
 
  var config = {
    creatorId: 'your-creator-slug',
    productId: 'YOUR_PRODUCT_ID',
    checkoutSessionSecret: 'your-session-secret-uuid',
    environment: 'production',
    redirectSettings: {
      success_redirect_url: 'https://yoursite.com/thank-you',
      always_redirect: true
    },
    theme: {
      theme: 'light',
      accent_color: '#007BFF',
      show_product_info: true,
      product_layout: 'left',
      show_coupon_row: true
    }
  };
 
  var checkout = PaymentCheckout.create(config);
  checkout.attachToElement(element);
 
  // Register events BEFORE calling init()
  checkout.on('checkout:success', function(data) {
    window.location.href = 'https://yoursite.com/thank-you';
  });
 
  checkout.on('checkout:error', function(error) {
    console.error('Payment error:', error.message);
  });
 
  checkout.on('form:submission_error', function(data) {
    console.error('Submission error:', data.data.errorMessage);
  });
 
  checkout.init();
});
</script>
```

#### Method B · Data attributes

Good for declarative config. Set every config field as a `data-*` attribute on a mount element. `PaymentCheckout.fromElement()` reads the attributes, builds the config, and attaches the iframe — but it does **not** call `init()`. Lifecycle (events + init) still goes through the returned instance the same way as Method A.

```js
<div
  id="fanbasis-checkout"
  data-creator-id="your-creator-slug"
  data-product-id="YOUR_PRODUCT_ID"
  data-checkout-session-secret="your-session-secret-uuid"
  data-environment="production"
  data-theme="light"
  data-accent-color="#007BFF"
  data-show-product-info="true"
  data-product-layout="left"
  data-show-coupon-row="true"
  data-success-redirect-url="https://yoursite.com/thank-you"
  data-always-redirect="true"
></div>
 
<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('fanbasis-checkout');
 
    // fromElement reads the data-* attributes, builds the config, and
    // attaches the iframe to the element — but it does NOT call init().
    // Capture the instance, register your handlers, then init() yourself.
    var checkout = PaymentCheckout.fromElement(el);
 
    checkout.on('checkout:success', function (data) {
      window.location.href = 'https://yoursite.com/thank-you?tx=' + data.transactionId;
    });
    checkout.on('checkout:error', function (err) {
      // Integration error (config / iframe state) — log it, don't show to buyer
      console.error('[checkout]', err.code, err.message);
    });
    checkout.on('form:submission_error', function (d) {
      // Gateway error (card_declined, insufficient_funds, etc.) — show to buyer
      alert(d.data.errorMessage);
    });
 
    checkout.init();
  });
</script>
```

Required attributes: `data-creator-id`, `data-product-id`, `data-checkout-session-secret`. Missing any of these throws an error. Method B is purely a config-via-attributes pattern; event handling + lifecycle still happen on the returned instance, exactly as in Method A.

#### Method C · Fluent builder

Chainable API for programmatic setup. Call `PaymentCheckout.create()` with no arguments to get a builder, then chain configuration methods and finish with `.build()`.

```js
var checkout = PaymentCheckout.create()
  .creatorId('your-creator-slug')
  .productId('YOUR_PRODUCT_ID')
  .checkoutSessionSecret('your-session-secret-uuid')
  .environment('production')
  .theme({
    theme: 'light',
    show_product_info: true,
    product_layout: 'left',
    show_coupon_row: true,
    accent_color: '#007BFF'
  })
  .redirectSettings({
    success_redirect_url: 'https://yoursite.com/thank-you',
    always_redirect: true
  })
  .build();
 
checkout.attachToElement(document.getElementById('checkout-container'));
 
checkout.on('checkout:success', function (data) {
  window.location.href = 'https://yoursite.com/thank-you?tx=' + data.transactionId;
});
checkout.on('checkout:error', function (err) {
  // Integration error (config / iframe state) — log it, don't show to buyer
  console.error('[checkout]', err.code, err.message);
});
checkout.on('form:submission_error', function (d) {
  // Gateway error (card_declined, insufficient_funds, etc.) — show to buyer
  alert(d.data.errorMessage);
});
 
checkout.init();
```

Builder methods (no `set` prefix): `creatorId`, `productId`, `checkoutSessionSecret`, `environment`, `theme`, `redirectSettings`, `containerOptions`, `couponCode`, `affiliateCode`, `bumpProductIds`, `overrideBaseUrl`, `showSubmitButton`. Finalize with `.build()`, which returns a `PaymentCheckout` instance.

Production-ready

### 3. The battle-tested template

This is what real integrations ship. Includes error handling, redirect settings, a dismissible error banner, and proper iframe styling. **Use this as your starting point for any new embed.**

```js
 
<style>
  #fanbasis-wrapper {
    width: 98%;
    max-width: 1100px;
    margin: 0 auto;
    min-height: 1100px;
  }
  #checkout-container {
    width: 98%;
    height: 1100px;
  }
  #checkout-container iframe {
    width: 98% !important;
    height: 1100px !important;
    border-radius: 20px;
  }
  .fb-error-banner {
    background: #fee2e2;
    border: 1px solid #ef4444;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .fb-error-banner p { color: #991b1b; margin: 0; font-size: 15px; }
  .fb-error-close {
    background: none; border: none; color: #991b1b;
    font-size: 20px; cursor: pointer; padding: 0 0 0 16px;
  }
</style>
 
<div id="fanbasis-wrapper">
  <div id="error-banner-slot"></div>
  <div id="checkout-container"></div>
</div>
 
<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async function () {
  var element = document.getElementById('checkout-container');
 
  var config = {
    creatorId: 'REPLACE_CREATOR_SLUG',
    productId: 'REPLACE_PRODUCT_ID',
    checkoutSessionSecret: 'REPLACE_SESSION_SECRET',
    environment: 'production',
    redirectSettings: {
      success_redirect_url: 'REPLACE_SUCCESS_URL',
      always_redirect: true
    },
    theme: {
      theme: 'light',
      accent_color: '#007BFF',
      show_product_info: true,
      product_layout: 'left',
      show_coupon_row: true
    }
  };
 
  var checkout = PaymentCheckout.create(config);
  checkout.attachToElement(element);
 
  // Success — redirect as fallback (redirectSettings handles it first)
  checkout.on('checkout:success', function(data) {
    window.location.href = 'REPLACE_SUCCESS_URL';
  });
 
  // Payment error — dismissible banner above form
  checkout.on('checkout:error', function(error) {
    var msg = (error && error.message)
      ? error.message
      : 'Something went wrong with your payment. Please try again.';
    var slot = document.getElementById('error-banner-slot');
    slot.innerHTML =
      '<div class="fb-error-banner">' +
      '<p>⚠ ' + msg + '</p>' +
      '<button class="fb-error-close" onclick="this.parentElement.remove()">×</button>' +
      '</div>';
  });
 
  // Form submission error — dismissible banner above form
  checkout.on('form:submission_error', function(data) {
    var msg = (data && data.data && data.data.errorMessage)
      ? data.data.errorMessage
      : 'Payment failed. Please check your details and try again.';
    var slot = document.getElementById('error-banner-slot');
    slot.innerHTML =
      '<div class="fb-error-banner">' +
      '<p>⚠ ' + msg + '</p>' +
      '<button class="fb-error-close" onclick="this.parentElement.remove()">×</button>' +
      '</div>';
  });
 
  checkout.init();
});
</script>
```

**To use:** Replace the 4 `REPLACE_*` values:

| Placeholder | Where to find it |
| --- | --- |
| `REPLACE_CREATOR_SLUG` | Creator's URL slug from Commas dashboard |
| `REPLACE_PRODUCT_ID` | Product ID from the Commas dashboard |
| `REPLACE_SESSION_SECRET` | Generated via the checkout session secret API (see below) |
| `REPLACE_SUCCESS_URL` | Your post-purchase thank-you page URL |

**Adjust dimensions:** Change `max-width`, `height`, and iframe dimensions to fit the target page. Common values: 1100px, 1200px, 1180px.
