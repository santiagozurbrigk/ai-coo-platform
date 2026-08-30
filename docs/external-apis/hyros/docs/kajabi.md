---
title: "Kajabi"
source: "https://docs.hyros.com/docs/kajabi"
seccion: "Integrations"
capturado: "2026-08-30"
---

# Kajabi

This document explains the steps required to track your Kajabi pages and payments using Hyros.

If you are using Kajabi Enhanced Checkouts, please follow the setup steps specifically for Enhanced Checkouts in the dedicated Enhanced Checkouts tracking video

1

## Install Hyros Script

💡 Already installed the script? Skip this step.

#### A. Copy the Universal Script

1. Copy the script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script.

#### B. Install the Universal Script

You'll need to paste the script in **both** locations below — pages and checkouts use separate script settings.

- For your pages: In Kajabi: Settings → search Site Details → scroll to Page Scripts → paste the script into Header Page Scripts → Save.
- For your checkouts: In Kajabi: Settings → Checkout → scroll to Header Tracking Code in the Checkout Tracking section → Add Header Tracking Code → paste the script → Save.

2

## Integrate Kajabi

#### A. Integrate Kajabi

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **Kajabi** → [**Connect Kajabi** →](https://app.hyros.com/external-services/cart-integration/kajabi) follow the prompts.

#### B. Complete Connection in Kajabi

1. In the Kajabi integration in Hyros: Actions → Settings → Get Webhook → copy the webhook URL

2. In Kajabi: Settings → Integrations and Webhooks → Webhooks → Create Webhook → fill in:

- Event: Payment Succeeded
- Endpoint URL: paste the Hyros webhook

Click **Add Webhook**.

---

## Enhanced Checkouts Tracking

#### A. Open Kajabi's Checkout Header Section

In **Kajabi**: **Settings** → **Checkout** tab → scroll down → click **Header Tracking Code**.

#### B. Install the Helper Script (first script)

code

```
<script>
  (function () {
    var MAX_RETRIES = 40;
    var retryCount = 0;
    function init() {
      var emailComponent = document.querySelector('pds-input[component-id="email"]');
      if (!emailComponent) { retryCount++; if (retryCount < MAX_RETRIES) { setTimeout(init, 500); } return; }
      var bridge = document.createElement('input');
      bridge.type = 'email'; bridge.name = 'email'; bridge.id = 'hyros-email-bridge';
      bridge.style.cssText = 'position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(bridge);
      function syncEmail(value) { 
        if (value && value !== bridge.value) { 
          bridge.value = value; 
          bridge.dispatchEvent(new Event('input', { bubbles: true })); 
          bridge.dispatchEvent(new Event('change', { bubbles: true })); 
        } 
      }
      var observer = new MutationObserver(function (mutations) { 
        for (var i = 0; i < mutations.length; i++) { 
          if (mutations[i].attributeName === 'value') { 
            syncEmail(emailComponent.getAttribute('value')); 
          } 
        } 
      });
      observer.observe(emailComponent, { attributes: true, attributeFilter: ['value'] });
      var shadowRoot = emailComponent.shadowRoot;
      if (shadowRoot) { 
        var shadowInput = shadowRoot.querySelector('input'); 
        if (shadowInput) { 
          shadowInput.addEventListener('input', function () { syncEmail(shadowInput.value); }); 
          shadowInput.addEventListener('change', function () { syncEmail(shadowInput.value); }); 
        } 
      }
      document.addEventListener('submit', function () { 
        var v = emailComponent.getAttribute('value') || ''; 
        if (!v && shadowRoot) { 
          var inp = shadowRoot.querySelector('input'); 
          if (inp) v = inp.value; 
        } 
        syncEmail(v); 
      }, true);
      var iv = emailComponent.getAttribute('value'); 
      if (iv) { syncEmail(iv); }
    }
    if (document.readyState === 'loading') { 
      document.addEventListener('DOMContentLoaded', init); 
    } else { 
      init(); 
    }
  })();
</script>
```

#### C. Install the Universal Script (second script)

Script order matters. The helper script must come first, the Hyros Universal Script second. Pasting them in reverse order will break checkout tracking.

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**. Then in Kajabi, paste it **directly below** the helper script in the same field. Click **Save**.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
