---
title: "Recurly"
source: "https://docs.hyros.com/docs/recurly"
seccion: "Payment Processors"
capturado: "2026-08-30"
---

# Recurly

This guide explains the steps required to connect Recurly to Hyros for tracking sales and payments.

1

## Recurly Credentials

In **Recurly**, collect both of these:

- Store Domain: the prefix from your Recurly login URL. Example: in www.yourcompany.recurly.com, the store domain is yourcompany.
- Private API Key: Integrations → API Credentials → copy your Private API Key

2

## Integrate Recurly

1. In Hyros: Settings → Integrations → [Recurly → Create New Integration](https://app.hyros.com/external-services/cart-integration/recurly)

- Name: Recurly (or anything you like)
- Store Domain: paste from Step 1
- Private API Key: paste from Step 1

2. On the new integration, click Configure → Get Webhook → copy the webhook URL.

3

## Install Webhook

In **Recurly**: **Integrations** → **Webhooks** → **Configure / Create Webhook** → **New Endpoint** → fill in:

- Endpoint Name: Hyros (or anything you like)
- Endpoint URL: paste the Hyros webhook
- HTTP Auth Username: leave blank
- HTTP Auth Password: leave blank

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
