---
title: "Chargebee"
source: "https://docs.hyros.com/docs/chargebee"
seccion: "Payment Processors"
capturado: "2026-08-30"
---

# Chargebee

This document explains the steps required to link your Chargebee account to Hyros for tracking sales events.

1

## Integrate Chargebee

#### A. Integrate Chargebee

In **Hyros**: **profile icon** → **Settings** → **Integrations** → search **Chargebee** → click it [→ **Connect Chargebee**](https://app.hyros.com/external-services/cart-integration/chargebee) → give it a name. Leave this tab open — you'll come back to it in Step 3.

#### B. Get Site Name and API Key

In **Chargebee**:

1. Your site name is shown in the top-left under your account name — copy it

2. For the API key: Settings → Configure Chargebee → scroll to API Keys → copy the key with Full Access

Use the Full Access key — not a restricted one.

Read-only or limited keys will let the integration authenticate but won't capture all the data Hyros needs.

#### C. Complete Integration

Back in **Hyros**:

- Paste the Site Name
- Paste the API Key

Click **Add Integration**.

#### D. Add the Webhook

Click **the gear icon**under the Actions tab inside the integration -> Click **Get Webhook**

In **Chargbee**:

1. Click Settings -> Configure Chargebee -> Webhooks -> Add Webhook

2. Name it Hyros and Paste the copied Webhook in the Webhook URL field

3. Select All Events -> Click Create

2

## Install Hyros Script

Already installed the script? Skip this step.

Please make sure the following UNIVERSAL Script is inserted in between the

`<head></head>`

code of your checkout pages:

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
