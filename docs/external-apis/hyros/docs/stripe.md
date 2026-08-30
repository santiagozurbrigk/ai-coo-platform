---
title: "Stripe"
source: "https://docs.hyros.com/docs/stripe"
seccion: "Integrations"
capturado: "2026-08-30"
---

# Stripe

This guide will walk you through integrating Stripe with HYROS to track payments and subscriptions.

**Subscription and new trial processing must be enabled by the HYROS Support Team.** If this feature needs to be enabled for an account, please contact the Support Team for assistance.

If you are using native Stripe payment pages (not embedded in your site), 100% accurate attribution may be difficult because the universal script cannot be added to Stripe's hosted payment pages.

Contact Support to explore potential workarounds!

Permissions: You must have Owner or Administrator access to your Stripe account.

1

## Integrate Stripe

1. In Hyros: go to your Stripe integration settings [-> Connect Stripe](https://app.hyros.com/external-services/cart-integration/stripe)

2. Click Configure

3. Follow the OAuth prompts in Stripe to grant Hyros Read & Write access

4. Once redirected back to Hyros, make sure the status toggle is ON

Grant Read & Write access. Not Read-only.

Hyros needs full access to process sales and updates. Limiting permissions will cause silent tracking failures.

2

## Install Universal Script

The HYROS script must be installed on any of your payment platforms unless you use Stripe. If you use **Stripe** - **CHECKOUT PAGES**, contact HYROS Support for assistance.

1. Copy the script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script.

2. Open your checkout page editor (the page where customers enter their credit card info)

3. Paste the script into the <head> section → Save

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---

## FAQs

#### Can I Ignore $0 Subscription Events ?

Stripe often sends "trial" or "setup" events with a $0 value, which can clutter your ROI reports.

**How to ignore these:**

1. Go to **Settings > Integrations > Stripe** and click the **Edit (Pencil)** icon.

2. Toggle **"Ignore subscription events with $0 value"** to **ON**.

3. Click **Save**.

#### How can I Fix Product Names?

If your products appear with confusing IDs instead of names in Hyros, follow this fix:

**Fix Nav:**

1. Navigate to your [**Stripe Integration Panel**](https://app.hyros.com/external-services/cart-integration/stripe).

2. Toggle **"Use charge description"** to **ON**.

3. In Stripe: Ensure "Description" field in your products contains the human-readable name you want to see in reports.

Or you can follow [this document.](https://docs.hyros.com/docs/product-naming-inside-hyros)

#### How can I Importing Historical Sales (Last 365 Days) ?

You can import up to 1 year of past data to calculate **Customer Lifetime Value (LTV)**.

**Note on Attribution:** Historical sales will **not** show an ad source (Meta/ Google) because the tracking script was not active when those sales occurred.

###### **Execution Steps:**

1. Inside the Stripe integration page, find the **"Import Data"** section.

2. Select the date range (up to 365 days).

3. Click **Upload/Import**.
