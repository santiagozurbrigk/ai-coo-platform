---
title: "SDK Demo"
source: "https://commasdocs.com/#sdk-demo"
seccion: "Herramientas y referencia"
ancla: "#sdk-demo"
capturado: "2026-08-30"
---

# SDK Demo

An interactive playground for the Commas Embedded Checkout SDK. The checkout below is the **real SDK** loaded from `cdn.embedded.fanbasis.io/embed/index.js`. Click **🎨 Customize** to tweak colors, layout, fields, or presets — the code snippet underneath updates in real time so you can copy exactly what you see.

Default Main checkout. Toggle features below or open **🎨 Customize** for full control — the snippet updates as you go.

Features

⚡ Sandbox

🎯 Programmatic

➕ Add-ons

📝 Prefill

Recipes

─── Customize drawer (slides in from right edge) ───

🎨 Customize

Colors

Hex values are wired straight to the SDK's theme config.

Accent / primary

Background

Surface

Heading

Label

Product text

Secondary text

Input background

Border

Layout

Features

Compose your checkout. Each toggle adds behavior to the live demo and the snippet below.

Sandbox mode sets `environment: 'sandbox'`

Programmatic submit external Pay button + event log

Add-ons on parent page addAddon / removeAddon, hides iframe product info

Prefill billing fields populates `theme.prefill`

---

Structural options the SDK exposes on the checkout iframe.

**Add-ons feature is on:**

product info inside the iframe is hidden by default so your addon cards on the parent page own the product display. If you'd rather show both, toggle

_Show product info_

below — the iframe hero comes back without affecting the parent-page cards.

Theme mode

Light

Dark

Product info position

Left

Right

Hidden

Billing form placement

Above payment

Side-by-side (left)

Show product info

Show coupon row

Fields

Choose which billing fields the buyer must complete.

First name

Last name

Email

Phone (SDK top-level `collectPhone` flag)

Country

Address

Presets

One-click looks. Apply, then tweak in the Colors tab.

Add-ons (shown only when Add-ons feature is on)

Add-ons live on your parent page, outside the iframe. Edit them here — the live preview cards above the checkout and the copy snippet both update in real time.

Add-ons

Addon ID

Name

Price (USD)

Description

Addon ID

Name

Price (USD)

Description

Prefill (shown only when Prefill feature is on)

Values you provide here are passed to the SDK via `theme.prefill`. The **Visible** + **Editable** toggles on each field map to `theme.fields.{x}.{hide, disable}` — uncheck _Visible_ to remove a field entirely, uncheck _Editable_ to lock its value (useful for already-known data like a logged-in email).

First name

Visible

Editable

Last name

Visible

Editable

Email

Visible

Editable

Phone (only sent if Phone is enabled in Fields)

Visible

Editable

Address

Visible Editable

Line 1

Line 2 (optional)

City

State / region

Postal code

Country (ISO-2)

─── Preview panel ───

Loading checkout SDK…

Triggers `checkout.submitForm()` from outside the iframe.

**▶ 💳 Test cards (click to copy a PAN, then paste into the card field)**

Use any future expiry · any 3-digit CVC · any postal code.

▼ Live events 0

─── Live snippet ───

### Embed this configuration on your pageLive

The snippet below reflects every customization above in real time. When you tweak a color, toggle a field, or switch a recipe, this code updates instantly. Pick your stack with the tabs — same config, language-appropriate idiom. Substitute your `creatorId`, `productId`, and a freshly created [checkout session secret](#embedded-checkout), then drop it into your codebase.

```js
<div id="checkout-container"></div>

<script src="https://cdn.embedded.fanbasis.io/embed/index.js"></script>
<script>
  const checkout = PaymentCheckout.create({
    creatorId: 'YOUR_CREATOR_SLUG',
    productId: 'YOUR_PRODUCT_ID',
    checkoutSessionSecret: 'YOUR_SESSION_SECRET',
    environment: 'production',
    collectPhone: false,
    redirectSettings: {
      success_redirect_url: 'https://your-site.com/thank-you',
      always_redirect: true
    },
    theme: {
      theme: 'light',
      show_product_info: true,
      product_layout: 'left',
      show_coupon_row: false,
      accent_color: '#007bff',
      background_color: '#ffffff',
      surface_color: '#f9fafb',
      heading_color: '#111827',
      label_color: '#374151',
      product_text_color: '#111827',
      secondary_color: '#6b7280',
      input_background_color: '#f9fafb',
      border_color: '#d1d5db',
      billing_display_fields: 'first_name,last_name,email,country,address',
      billing_form_placement: 'above'
    }
  });
  checkout.attachToElement(document.getElementById('checkout-container'));

  // Required handlers — register BEFORE init() so no events are missed.
  checkout.on('checkout:success', function (data) {
    // Fallback redirect (in case redirectSettings doesn't fire)
    window.location.href = 'https://your-site.com/thank-you?tx=' + data.transactionId;
  });
  checkout.on('checkout:error', function (err) {
    // Integration error (config / iframe state) — log it, don't show to the buyer
    console.error('[checkout]', err.code, err.message);
  });
  checkout.on('form:submission_error', function (d) {
    // Gateway error (card_declined, insufficient_funds, etc.) — show to the buyer
    alert(d.data.errorMessage);
  });

  checkout.init();
</script>
```
