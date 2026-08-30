---
title: "Easy Pay Direct"
source: "https://docs.hyros.com/docs/easy-pay-direct"
seccion: "Payment Processors"
capturado: "2026-08-30"
---

# Easy Pay Direct

This document explains the steps required to link your Easy Pay Direct account to Hyros for tracking sales events.

1

## Easy Pay Direct Private Key

#### A. Create a Private Security Key in EasyPay Direct

In **EasyPay Direct**: **Options** (left-hand menu) → **Settings** → **Security Keys** → **Add New Private Key** → fill in the form, including:

- API access enabled
- Cart access enabled

Click **Save** and copy the generated **Security Key** — you'll need it in Step 2.

2

## Integrate Easy Pay Direct

#### A. Integrate Easy Pay Direct

1. In Hyros: Settings → Integrations → [EasyPay → Create New Integration →](https://app.hyros.com/external-services/cart-integration/easy_pay_direct)

- Name: anything you like
- Private Security Key: paste the key from Step 1

2. Click Save Integration → Configure → Get Webhook → copy the webhook URL.

3

## Install Webhook

In **EasyPay Direct**: **Options** → **Settings** → **Webhooks** → **Create** → fill in:

- URL: paste the Hyros webhook
- Subscribed Events: transaction.refund.success and transaction.sale.success

Click **Save**.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
