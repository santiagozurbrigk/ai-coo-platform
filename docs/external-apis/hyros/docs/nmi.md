---
title: "NMI"
source: "https://docs.hyros.com/docs/nmi"
seccion: "Integrations"
capturado: "2026-08-30"
---

# NMI

This document explains the steps required to link your NMI account to Hyros for tracking sales events.

#### A. Integrate NMI

In **Hyros**: **Settings** → **Integrations** → search **NMI** → click it → [**Connect NMI**](https://app.hyros.com/external-services/cart-integration/nmi) → give the integration a name. Leave this tab open.

#### B. Create a Private Security Key in NMI

In **NMI**: **My Settings** → **Security Keys** → scroll down → **Add New Private Key** → fill in:

- Name: anything you like
- Username: select the associated user
- Key Permissions: make sure API is selected

Copy the generated key.

#### C. Finish the Integration in Hyros and Copy the Webhook

Back in **Hyros**: paste the key → **Create Integration** → click **Edit** → copy the webhook URL.

#### D. Add the Webhook in NMI

In **NMI**: **Options** → **Settings** → scroll to **Webhooks** → **Endpoints** → **Create** → fill in:

- URL: paste the Hyros webhook
- Subscribed Events: Transaction Sale Success, Transaction.auth.success and Transaction Refund Success

Click **Save Changes**. NMI is connected.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
