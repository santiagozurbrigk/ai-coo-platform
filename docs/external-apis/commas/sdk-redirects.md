---
title: "Redirect Settings"
source: "https://commasdocs.com/#sdk-redirects"
seccion: "SDK de checkout"
ancla: "#sdk-redirects"
capturado: "2026-08-30"
---

DEVELOPER RESOURCES

# Redirect Settings

⚠ Without redirect settings the checkout gets stuck on "processing"

Without redirect settings, the checkout will get stuck on "processing" after a successful payment. Configure them before going live.

### Configuration

```
redirectSettings: {
  success_redirect_url: 'https://yoursite.com/thank-you',
  failure_redirect_url: 'https://yoursite.com/checkout-failed', // optional
  always_redirect: true  // ALWAYS set this to true
}
```

| Property | Type | Description |
| --- | --- | --- |
| `success_redirect_url` | string | URL to redirect to after successful payment |
| `failure_redirect_url` | string | URL to redirect to after failed payment (optional) |
| `always_redirect` | boolean | **Always set to `true`** for reliable redirects. Also **required** for the failure redirect to fire — see below. |

⚠ Failure redirect only fires when

`always_redirect: true`

`failure_redirect_url` is silently ignored unless `always_redirect` is also set to `true`. The success URL is wired into the iframe directly; the failure URL is handled client-side by the SDK and gated by `always_redirect`. If you only set `failure_redirect_url` without `always_redirect: true`, failed payments will stay on the checkout page.

### Best practice

Always configure **both** `redirectSettings` and a `checkout:success` event handler as a fallback:

```
// In config
redirectSettings: {
  success_redirect_url: 'https://yoursite.com/thank-you',
  always_redirect: true
}
 
// As event handler (fallback if redirect mechanism fails)
checkout.on('checkout:success', function(data) {
  window.location.href = 'https://yoursite.com/thank-you';
});
```
