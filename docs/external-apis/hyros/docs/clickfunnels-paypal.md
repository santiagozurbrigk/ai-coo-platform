---
title: "ClickFunnels + PayPal Integration"
source: "https://docs.hyros.com/docs/clickfunnels-paypal"
seccion: "Integrations"
capturado: "2026-08-30"
---

# ClickFunnels + PayPal Integration

If you use ClickFunnels checkout pages and PayPal (& other payment processors), the easiest way to track your sales is to follow the instructions below.

This document explains the steps required to link your ClickFunnels account to HYROS for tracking sales events.

Note

Please only use a single webhook. If you have more than one funnel you are tracking, you should use the same webhook for all of them.

#### A. Install the Hyros script on Your Funnel

💡 Already installed the script? Skip to Step B

1. Copy the script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script.

2. In ClickFunnels: open your funnel → paste the script into the Header section → Save

#### B. Connect ClickFunnels in Hyros and Copy Webhook

In **Hyros**: **Settings** → **Integrations** → search **ClickFunnels** → [**Connect ClickFunnels**](https://app.hyros.com/external-services/cart-integration/click_funnels) → give it a name → **Edit** → **Get Webhook** → copy the webhook URL.

#### C. Install the Webhook in ClickFunnels

In **ClickFunnels**: scroll down to **Manage Your Funnel Webhooks** → create a new webhook → fill in:

- URL: paste the Hyros webhook
- Events: select Purchase Created, Purchase Updated, and Purchase Destroyed

Click **Create Funnel Webhook**.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales
