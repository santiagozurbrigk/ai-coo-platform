---
title: "SamCart"
source: "https://docs.hyros.com/docs/samcart"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# SamCart

This document explains the steps required to link your SamCart account to HYROS for tracking sales events.

Please note that you will only be able to complete the integration if you have the "Core" plan or higher.

1

## Install Hyros Script

Do not use the Universal script from Hyros on your Samcart pages. You must use the custom code provided below, as explained in the video

#### A. Copy the Universal Script

Copy the script below, and replace the **PH** value with the one from the normal script which you can find in **Settings -> Tracking -> Universal Tracking Script**

code

```
<script>
var head = document.head;
var _hrsuts = document.createElement('script');
_hrsuts.type = 'text/javascript';
_hrsuts.src = "https://t.hyros.com/v1/lst/universal-script?ph=[PLACE-PH-VALUE-FROM-HYROS]&tag=!clicked&ref_url=" + encodeURI(document.URL) ;
head.appendChild(_hrsuts);
</script>
```

#### B. Install the Universal Script

In **SamCart**: **Settings** → **Tracking and Pixels** → paste the script into **Embed HTML Scripts** → **Save Changes**.

2

## Integrate Samcart

#### A. Create Integration

In **Hyros**: **Settings** → **Integrations** → find **SamCart** → [**Configure Samcart** →](https://app.hyros.com/external-services/cart-integration/samcart) **Create Integration** → name it `SamCart` (or anything you like) → **Add Integration**.

#### B. Copy the Webhook

In the integration you just created: click **Edit** → **Get Webhook** → copy the webhook URL.

3

## Finish Integration

#### A. Open the Webhooks App

In **SamCart**: **Apps** → search **Webhooks** → click **Open App**.

#### B Connect the Hyros webhook

In the Webhooks section: **Options** → **Connect New App Instance** → fill in:

- App Instance Name: Hyros
- Notify URL: paste the Hyros webhook

Click **Connect**.

#### C. Add Rules

You'll add **one rule per event type**. For each, click **Select an Action** → **Send Notify URL Post** → choose the event → **Add Rule**.

Add these rules based on what you sell:

- Product Purchased
- Subscription Charged
- Product Refunded

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
