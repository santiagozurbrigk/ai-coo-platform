---
title: "Kartra"
source: "https://docs.hyros.com/docs/kartra"
seccion: "Integrations"
capturado: "2026-08-30"
---

# Kartra

This document explains the steps required to link your Kartra account to HYROS for tracking sales events.

1

## Install Hyros Script

Already installed the script? Skip this step.

#### A. Copy the Universal Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

#### B. Install it into Every Kartra Page

In **Kartra**: **My Pages** → select the page you want to track → **Edit** → **Settings** → **Tracking Code** → paste the script into **Embed Facebook Ads Tracking Code** → **Apply**.

**Apply**. Repeat for every page — pages without the script won't be tracked.

**Paste it in the Facebook Ads field — not the regular**`<head>`**field.**

Despite the name, this is the only field that works for Hyros tracking. The standard "Embed Tracking Code into the Head Section" field will **not** work, even though it looks like the obvious choice.

2

## Integrate Kartra

#### A. Integrate Kartra

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search [**Kartra**](https://app.hyros.com/external-services/cart-integration/kartra)→ click it → give the integration a name → in the **Actions** tab, click the **gear icon** → **Get Webhook** → copy the webhook URL.

#### B. Enable Outbound API in Kartra

In **Kartra**: **My Integrations** → **API** → **My API** → **Outbound API** → **Change** → make sure Outbound API is **Activated**.

Already activated? Skip ahead to Step C.

#### C. Add the Webhook in Kartra

Click **Add** to create a new webhook → fill in:

- Webhook URL: paste the Hyros webhook
- Event: Customer Buys Product
- Funnel: select the funnel you want to track
- Events: select the specific events to track
- Price Point: Any Price Point

#### D. Repeat for Every Product or Event

Reuse the same webhook URL to add tracking for every product or event you want covered.

One webhook, many products. You don't need a new webhook URL for each product — just add a new entry in Kartra using the same Hyros webhook URL.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
