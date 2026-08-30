---
title: "Digistore24"
source: "https://docs.hyros.com/docs/digistore24"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# Digistore24

This document explains the steps required to track Digistore24 checkouts and sales with Hyros.

1

## Integrate Digistore24

#### A. Connect DigiStore24

1. In Hyros: profile icon → Settings → Integrations → search Digistore24 → Configure → [Connect Digistore →](https://app.hyros.com/external-services/cart-integration/digistore24)

2. Click the gear icon → Get Webhook → copy the webhook URL

#### B. Configure IPN

In **Digistore24**: **Settings** → **Integrations / IPN** → **Add New Connection** → scroll down → select **Generic IPN** → fill in:

- Name: Hyros
- Products: All
- Orders in these languages: All
- Send notifications: toggle ON for Orders by Customers
- For order event: deselect everything except Payment Denial
- IPN URL: paste the Hyros webhook (from Step 1)
- Success validation: select HTTP Code

Click **Save**.

2

## Tracking Digistore24 Checkouts

#### A. Copy Universal Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

#### B. Create New Tracking Setup in DigiStore24

In **Digistore24**: **Settings** → **Tracking** → **Set Up New Tracking** → fill in:

- Name: Hyros
- Sale type: All
- Add to: Order Form and Order Confirmation Page
- On order confirmation page: Display on every visit
- Products to track: select Main Product, Add-ons, and Upsells
- Tracking type: Tracking Code
- Tracking code: paste the Hyros Universal Script (from Step 1)

Click **Save**.

3

## Tracking Checkout Button

For Hyros to append the `sessionId` parameter, your checkout link needs an HTML element with the ID `hyros-url`. There are **two ways** Hyros looks for it — set up your page using either method:

1. Search for a button with the id `hyros-url`, which would have the link you are looking for.

2. Search for a div with the id `hyros-url` and inside the div, look for the first element with tag `a`, which should contain the link you are looking for.

For example, if you have a link:

html

```
<a href="<checkout_url>"> Buy Product </a>
```

You need to add the id like following:

html

```
<a id="hyros-url" href="<checkout_url>"> Buy Product </a>
```

So that we can append the session id at the end.

**IMPORTANT:**

In some cases, you might not be able to locate the checkout button above. This usually indicates that you're using an iframe, in which case you'll need to follow this step to identify the URL link:

Search for an element with the id

`my-order-form`

, and inside the element, search for the first element of type

`iframe`

, which should contain the link you are looking for. Once you've identified the URL, follow the guidelines provided in the video above.

4

## Contact the Digistore24 Support

**Important!**

Once you have finished following the above steps, and before saving the entire configuration, you will need to send an email to Digistore24 support (

[code@digistore24.com](mailto:code@digistore24.com)

) and include the Universal script for review and confirmation.

Once you receive confirmation from Digistore24 support, you will be able to save your tracking configuration and the integration will be completed.

This is an additional step in case you want to track organic sources for Digistore, this will allow organic sources links attribution without Universal Script in the Checkout.

If you need further assistance in setting up Digistore24 integration, please contact Hyros support or your onboarding analyst.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
