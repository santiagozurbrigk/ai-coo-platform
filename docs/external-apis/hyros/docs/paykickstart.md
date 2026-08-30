---
title: "PayKickstart"
source: "https://docs.hyros.com/docs/paykickstart"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# PayKickstart

This document explains the steps required to link your PayKickstart account to Hyros for tracking sales events.

1

## Integrate Paykickstart

#### A. Connect PayKickStart

1. In Hyros: profile icon → Settings → Integrations → search PayKickstart → click it [→ Connect PayKickstart](https://app.hyros.com/external-services/cart-integration/paykickstart)

2. Click the gear icon (Configure) → Get Webhook → copy the webhook URL

#### B. Install Webhook

In **PayKickstart**: left menu → hover **Campaigns** → **Product List** → click the **three dots** next to the product you want to track → **Edit** → **IPN Integration** → **Add IPN Integration** → fill in:

- IPN URL: paste the Hyros webhook
- Events: select All Events

Save the integration.

2

## Install Universal Script

💡 Already installed the script? Skip this step.

#### A. Copy Universal Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

#### B. Install the Universal Script

In **PayKickstart**: **Campaigns** (left menu) → **Products List** → click the **three dots** next to your product → **Edit** → click the **card icon** (Checkout) → scroll to the bottom → in **Advanced Tracking Code** → **Header Code** → paste the script → **Save**.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
