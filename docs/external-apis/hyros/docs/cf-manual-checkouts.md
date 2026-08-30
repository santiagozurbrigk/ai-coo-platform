---
title: "CF Manual Checkouts"
source: "https://docs.hyros.com/docs/cf-manual-checkouts"
seccion: "Payments"
capturado: "2026-08-30"
---

# CF Manual Checkouts

If you use Clickfunnels Manual Checkout pages the easiest way to track your sales is to follow the instructions below. This document explains the steps required to link your Clickfunnel account to Hyros for tracking sales events.

Please only use a single webhook. If you have more than one funnel you are tracking, you should use the same webhook for all of them. If you or the sales team are manually running customer's cards please follow the steps from the second video.

#### A. Install Universal Script

1. Copy the script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script.

2. In ClickFunnels: open your funnel → paste the script into the Header section → Save

Already installed the script? Skip to the next step.

#### B. Connect ClickFunnels

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **ClickFunnels** → click it → [**Connect ClickFunnels** →](https://app.hyros.com/external-services/cart-integration/click_funnels) give it a name → click the **gear icon** → **Get Webhook** → copy the webhook URL.

#### C. Install Webhook

In **ClickFunnels**: scroll to **Manage Your Funnel Webhooks** → create a new webhook → fill in:

- URL: paste the Hyros webhook
- Events: select Purchase Created, Purchase Updated, and Purchase Destroyed

Click **Create Funnel Webhook**.

---

## Manually Running Customer's Cards

#### A. Install Universal Script on your funnel pages (except checkout)

1. Copy the script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script.

2. In ClickFunnels: open your funnel → paste the script into the Header section → Save

Do NOT install the script on your checkout page.

#### B. Connect ClickFunnels

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **ClickFunnels** → click it → **Connect ClickFunnels** → give it a name → click the **gear icon** → **Get Webhook** → copy the webhook URL.

#### C. Install Webhook

In **ClickFunnels**: scroll to **Manage Your Funnel Webhooks** → create a new webhook → fill in:

- URL: paste the Hyros webhook
- Events: select Purchase Created, Purchase Updated, and Purchase Destroyed

Click **Create Funnel Webhook**.
