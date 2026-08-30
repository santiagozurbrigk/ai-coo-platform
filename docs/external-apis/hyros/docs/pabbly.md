---
title: "Pabbly"
source: "https://docs.hyros.com/docs/pabbly"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# Pabbly

Connect Pabbly to HYROS to bridge your checkout or CRM platforms that don't have native integrations.

Please contact support or your Onboarding analyst directly if you have any questions.

1

## Ensure Your Software Does Not Already Integrate with HYROS

Most of the time HYROS can be easily integrated directly with your Checkout, Payment Processor and/or CRM in order to receive sales and other events. We highly recommend following the initial setup guides first and only using this guide if you have a unique system that does not directly integrate with HYROS.

Check [All integrations](https://docs.hyros.com/docs/all-integrations) Page to see if your system already has a direct integration.

2

## Track Your Funnel Pages

Copy the universal script from

**HYROS → Tracking → Universal Script**

and add it to the

`<head></head>`

code of all of your funnel pages, including your checkout pages if possible.

If you have a Sales Call funnel and your sales team members complete the checkout process for your clients, please do NOT add this script to your checkout page. Otherwise your sales team will be tracked and associated with the sale.

3

## Configure Pabbly Connect

1.

Ensure you have completed your initial setup instructions for the funnel(s) you would like to track and confirm your system does NOT have a native integration.

2.

Access your Pabbly account, click on

Pabbly Connect

and then click on

Workflows

to get to the Trigger/Action configuration screen.

3.

Select the platform that will send data to HYROS through Pabbly from the Trigger section.

4.

Set your trigger event to an option related to a New Payment, New Charge or New Customer depending on the data we want to transmit to HYROS (these options are different for each system).

5.

Confirm the data that is recorded in Pabbly and ensure the customer email, product name and product purchase value are recorded other details you want to transmit depending on the event.

6.

Select HYROS from the Action section and choose the event to create in our platform from the dropdown list (Create Lead, Created Order, Create Product, Refund Order, etc.) and then click on

Connect

. The system will ask for an

API key

.

**7.** Under API key, place your HYROS API key which can be found by going to **HYROS → Settings → API keys**.

8.

Configure the Pabbly action from the fields displayed after entering your API key. When everything has been configured, please click on

Save and Send Test Request

to confirm the setup has been completed successfully.

This completes the Pabbly Integration. Please contact support or your Onboarding analyst directly if you have any questions.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
