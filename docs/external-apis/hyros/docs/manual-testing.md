---
title: "Troubleshooting Sales"
source: "https://docs.hyros.com/docs/manual-testing"
seccion: "Troubleshooting"
capturado: "2026-08-30"
---

# Troubleshooting Sales

Learn how to manually test your HYROS tracking setup to ensure everything is working correctly.

If you don't have any recorded sales yet, either wait for a payment to be processed or place an order yourself, which you can later refund or complete the checkout using a 100% discount code.

---

#### What this Doc does

Helps you diagnose why sales aren't appearing correctly in Hyros — missing entirely, missing attribution, or showing as duplicates — and how to fix each case. Also covers using the Setup Chrome extension to test your funnel end to end.

---

#### Scenario 1 - Sale doesn't appear in Hyros at all

**What you'll see:** A lead opted in and purchased (you can see the purchase in your payment processor), but the sale isn't in Hyros.

**What it means:** Your payment processor isn't sending the sale to Hyros.

Fix

Check your payment processor connection:

- If you use a funnel builder (ClickFunnels, Kajabi, ThriveCart, etc.): confirm your payment processor is connected inside that platform — that's how Hyros pulls the sales through the integration
- If you connect the processor directly: confirm the payment processor is connected inside your Hyros account

---

#### Scenario 2 - Sale appears, but with no source or attribution

**What you'll see:** Sales come in, but with **no origin source**, no tags other than the sale tag, and **no click history**.

**What it means:** The Hyros script is missing from your checkout pages, so Hyros can't connect the sale to the lead's journey.

Fix

**Check your tracking script:**

- Make sure the Universal Script is on all pages a lead can land on
- If it's already added, confirm it's in the right place — the script must be in the header section across the entire funnel

Once the script is capturing leads correctly, Hyros can attribute the sale to the lead's source.

---

#### Scenario 3 - Duplicate sales appearing

**What you'll see:** Two sales for the same lead in the same time frame, with **different product names**.

**What it means:** The same sale is coming in through **two connected integrations at once**. This happens when a payment processor (e.g. NMI) is connected **both directly to Hyros AND inside another integration** (Shopify, ClickFunnels, Kajabi, ThriveCart) that's also connected to Hyros.

**Example:** NMI is connected directly to Hyros, _and_ NMI is also connected inside Shopify — which is connected to Hyros too. Both send the same sale, creating a duplicate.

Fix

Remove one of the two integrations causing the duplication — keep only one path for that sale to reach Hyros.

Do not integrate a checkout system AND a processor. You will have duplicate sales if you integrate more than one payment source.

---

#### (AUTOMATIC) Testing your funnel with the Setup Chrome extension

Download the HYROS Setup Extension and follow the steps outlined [**here**](https://docs.hyros.com/docs/hse-extension).

The Setup extension lets you test your entire funnel end to end to confirm sales track correctly.

1. Install and open the Setup Chrome extension

2. Paste your funnel link → click Start Opt-In to begin testing

3. Leave an email somewhere in the funnel (e.g. on the checkout page) — confirm the lead registers in Hyros

4. Make a test purchase and land on the thank-you page

5. Check that the sale registers in Hyros

---
