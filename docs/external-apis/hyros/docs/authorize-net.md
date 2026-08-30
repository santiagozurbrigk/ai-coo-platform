---
title: "Authorize.Net"
source: "https://docs.hyros.com/docs/authorize-net"
seccion: "Integrations"
capturado: "2026-08-30"
---

# Authorize.Net

This document explains the steps required to link your Authorize.net account to Hyros for tracking sales events.

#### A. Access Hyros

In Hyros: **profile icon** → **Settings** → **Integrations** → search **Authorize.net** → click it → [**Connect Authorize.net**](https://app.hyros.com/external-services/cart-integration/authorizenet)→ give it a name. Leave this tab open.

#### B. Get API

In **Authorize.net**: **Settings** → **API Credentials & Keys** → copy your **API Login ID**. For the **Transaction Key**: click **New Transaction Key** → **Submit** → copy the key.

#### C. Connect and Copy Webhook

Back in Hyros: paste the **API Login ID** and **Transaction Key** → **Add Integration** → **Edit** → **Get Webhook** → copy the webhook URL.

#### D. Add the Webhook in Authorize.net

In **Authorize.net**: **Settings** → **Webhooks** → **Add Endpoint** → fill in:

- Name: Purchase (or any name you like)
- Endpoint URL: paste the Hyros webhook
- Status: Active
- Events: tick All Events

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---

## FAQ

#### Missing Sales?

**When saving the webhook if the error message appears "Error: please integrate a signature key from the merchant/partner interface to create a new webhook":**

Go to Settings → API Credentials & Keys above and then create a new Signature key here:
