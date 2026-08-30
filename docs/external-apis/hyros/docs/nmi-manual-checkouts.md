---
title: "NMI Manual Checkouts"
source: "https://docs.hyros.com/docs/nmi-manual-checkouts"
seccion: "Payments"
capturado: "2026-08-30"
---

# NMI Manual Checkouts

This document explains the steps required to link your NMI account to Hyros for tracking sales events.

#### A. Integrate NMI

In **Hyros**: **Settings** → **Integrations** → search **NMI** → click it → [**Connect NMI** →](https://app.hyros.com/external-services/cart-integration/nmi)give the integration a name. Leave this tab open.

#### B. Create Private Security Key

In **NMI**: **My Settings** → **Security Keys** → scroll down → **Add New Private Key** → fill in:

- Name: anything you like
- Username: select the associated user
- Key Permissions: make sure API is selected

Copy the generated key.

#### C. Complete Integration in Hyros

Back in **Hyros**: paste the key → **Create Integration** → click **Edit** → copy the webhook URL.

#### D. Install Webhook in NMI

In **NMI**: **Options** → **Settings** → scroll to **Webhooks** → **Endpoints** → **Create** → fill in:

1. URL: paste the Hyros webhook

2. Subscribed Events:

- Transaction Sale Success
- Transaction Refund Success
- Transaction Auth Success
