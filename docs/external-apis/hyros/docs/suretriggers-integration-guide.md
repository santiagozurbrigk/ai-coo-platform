---
title: "SureTriggers"
source: "https://docs.hyros.com/docs/suretriggers-integration-guide"
seccion: "General"
capturado: "2026-08-30"
---

# SureTriggers

Use SureTriggers as a bridge to send sales data to Hyros from platforms that don't have a native Hyros integration (e.g. some checkout systems, payment processors, or CRMs).

📋 Check for a native integration first.

Most checkout, payment, and CRM platforms integrate directly with Hyros — those setups are more reliable and easier to maintain. Only use SureTriggers if your platform has **no direct Hyros integration**.

[See the integrations list before continuing.](https://docs.hyros.com/docs/all-integrations)

1

## Install the Hyros Script

Copy the script below, or In **Hyros**: **profile icon** → **Settings** → **Tracking** → copy the **Universal Script**.

Then add it to the `<head></head>` of every funnel page you want tracked (including checkout pages where possible).

Sales Call funnels: do NOT add the script to your checkout page.

If you have a sales call funnel where your team manually processes payments for clients, adding the script to checkout will misattribute those sales to your sales team. See the dedicated sales call funnel guide for the correct setup.

2

## Set Up SureTriggers Trigger

1. In SureTriggers: open Workflows → click Add Trigger

2. Select the platform that will send data to Hyros (your checkout, payment processor, etc.)

3. Set the trigger event to one of: New Payment, New Charge, or New Customer (exact names vary by platform)

**The data sent by your trigger must include:**

- Customer email
- Product name
- Product value (price)

Plus any other fields relevant to the event you're tracking. Missing the email means Hyros can't create the sale.

3

## Add Hyros as the action

1. Click Add Action → select Hyros as the receiver

2. From the Event dropdown, choose the event to create in Hyros (e.g. Create Lead, Create Order, Create Call, Refund Order)

3. Click Select Connection → Create New Connection → paste your Hyros API key

4

## Get Hyros API key

In **Hyros**: **Settings** → **Profile** → scroll to **API Key** → click **Copy API Key**. Paste it into SureTriggers.

5

## Map the remaining fields

Once authenticated, SureTriggers will show all available Hyros fields for the event type you chose. Map each one to the corresponding data from your trigger (email → email, product name → product name, etc.) and save.
