---
title: "Invoiced"
source: "https://docs.hyros.com/docs/invoiced"
seccion: "Payment Processors"
capturado: "2026-08-30"
---

# Invoiced

This guide explains the steps required to connect Invoiced to Hyros for tracking sales and payments.

1

## Get API Key

In **Invoiced**: **Settings** → **Integrations** → **Developers** → **Add a New API Key** → copy both:

- Name (anything you like)
- Secret (your API key)

2

## Integrate Invoiced

1. In Hyros: Settings → Integrations → [Invoiced → Create Integration](https://app.hyros.com/external-services/cart-integration/invoiced)

2. Paste the Name and Secret from Step 1 → save

3. Click Edit on the new integration → copy the webhook URL

3

## Install Webhook

1. In Invoiced: Settings → Integrations → Developers → Webhooks → New Webhook → paste the webhook URL from Step 2.

2. Make sure Enabled is on → click Select Events → select all four of these:

- payment.created
- payment.deleted
- customer.created
- refund.created

Click **Save**.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
