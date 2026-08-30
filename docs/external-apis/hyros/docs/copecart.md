---
title: "CopeCart"
source: "https://docs.hyros.com/docs/copecart"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# CopeCart

This document explains the steps required to link your CopeCart account to Hyros for tracking sales events.

#### A. Integrate CopeCart

1. In Hyros: profile icon → Settings → Integrations → search CopeCart → click it → Connect CopeCart

2. Fill in:

- Name: anything you like
- Secret Key: any string you choose (you'll use the same one in CopeCart in Step 3)

Click **Add Integration**.

#### B. Install Webhook

1. On the new CopeCart integration in Hyros: click Edit → Get Webhook → copy the webhook URL

2. In CopeCart: Settings → IPN Integrations → New Integration → select Hyros → fill in:

- Integration Name: the name from Hyros (Step 1)
- Webhook URL: the webhook from above
- Secret Key: the same secret key you used in Step 1
- Integration Type: select Contract Fulfillment

Click **Save**.

#### C. Activate Tracking per Product

In **CopeCart**: **Products** → select the product to track → **Edit** → scroll to **Integrations** → toggle **ON** _Activate IPN integrations for this product_ → select your **Hyros integration**.

Repeat for every product you want to track.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
