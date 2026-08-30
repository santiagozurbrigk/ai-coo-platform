---
title: "Hotmart"
source: "https://docs.hyros.com/docs/hotmart"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# Hotmart

This document explains the steps required to link your Hotmart account to Hyros for tracking sales events.

1

## Integrate Hotmart

#### A. Get Hotmart Verification Token

In **Hotmart**: top-right **Browse** menu → search **Tools** → open **Webhook API and Notifications** → **Authentication** → copy the **Hottok verification token**.

#### B. Integrate Hotmart

1. In Hyros: profile icon → Settings → Integrations → search Hotmart → [→ Connect Hotmart](https://app.hyros.com/external-services/cart-integration/hotmart)

2. Name it Hotmart (or anything you like)

3. Paste the Hottok token into the webhook field → Add Integration

2

## Install Webhook

#### A. Copy Webhook

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **Hotmart** → click it → open **Settings** → **Get Webhook** → copy the webhook URL.

#### B. Register Webhook

In **Hotmart**: top **Browse** menu → search **Tools** → open **Webhook API and Notifications** → in the **My Settings** menu → click **Register Webhook** → fill in:

- Settings Name: Hyros
- Products: All Products
- URL: paste the Hyros webhook
- Version: Version 2
- Events: select Purchase Approved and Purchase Refunded

Check the confirmation box and click **Save**.

3

## Track Checkout Page

#### A. Get Pixel ID and Label from Hyros

In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy your:

- Pixel ID
- Label

#### B. Open Tracking Pixel in Hotmart

In **Hotmart**: top **Browse** menu → **Tracking Pixel** → select the product you want to track → select **Hyros Pixel**.

#### C. Configure the Hyros Pixel

Fill in:

- Hyros Pixel ID: paste from Step 1
- Hyros Label: paste from Step 1
- Sales Made: select all payment methods and all transaction amounts
- Checkout page visits: enabled

Click **Save**.

If you do not have the option to select the Hyros Pixel on your list, you will need to contact Hotmart support to activate this for you.

Here is a short template on how to send the request:

Hi Hotmart Support,

Please enable the HYROS Pixel for my account.

Hotmart account email: [your email]

Product(s): [all]

Goal: allow HYROS to receive checkout/purchase events for accurate attribution.

Best,

[Your Name]

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
