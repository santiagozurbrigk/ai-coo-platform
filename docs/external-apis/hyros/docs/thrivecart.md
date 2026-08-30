---
title: "ThriveCart"
source: "https://docs.hyros.com/docs/thrivecart"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# ThriveCart

This document explains the steps required to link your ThriveCart account to HYROS for tracking sales events.

1

## Install Hyros Script

Already installed the script? Skip this step.

#### A. Copy the Universal Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

#### B. Install the Universal Script

In **ThriveCart**: **Products** → click **Edit** on the checkout you want to track → **Checkout** → **Tracking** → scroll to **Custom Tracking Code** → enable it → paste the script → **Save and Get URL**.

#### C. Repeat for Every Checkout

Apply the script to every ThriveCart checkout you want to track. Checkouts without the script won't be tracked.

2

## Integrate ThriveCart

#### A. Create the Integration and Copy the Webhook

In **Hyros**: **profile icon** → **Settings** → **Integrations** → find **ThriveCart** → click it → [**Connect ThriveCart** →](https://app.hyros.com/external-services/cart-integration/thrivecart) name it (anything you like) → **Add Integration** → click **Edit** → copy the **webhook URL**.

#### B. Install Webhook

In **ThriveCart**: **Settings** → **API and Webhooks** → **Webhooks and Notifications** → **Add New Webhook** → fill in:

- Name: Hyros
- Webhook URL: paste the Hyros webhook

Click **Save Webhook**.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
