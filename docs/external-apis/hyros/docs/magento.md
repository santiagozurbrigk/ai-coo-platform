---
title: "Magento"
source: "https://docs.hyros.com/docs/magento"
seccion: "Checkouts"
capturado: "2026-08-30"
---

# Magento

This document explains the steps required to link your Magento store to Hyros for tracking sales events.

1

## Integrate Hyros in Magento

The callback URL and Identity link URL must be left blank:

2

## Adjust API Settings

Click API and enable the following resources exactly below:

3

## Integrate Magento in Hyros

Using the store URL and access token inside your Magento account, go inside your Hyros account integration settings and click on Magento, or click

[HERE](https://app.hyros.com/#/mh/external-services/cart-integration/magento)

. Create the integration and then copy the webhook, you will need this for later.

4

## Install Webhook Extension

Magento does not support webhooks natively therefore you will need to install an extension in order to continue integrating Magento in Hyros. There are two options:

5

## Configure Webhook

In the System tab, configure the webhook for the events. You will need to create the "invoice" event, "refund" event and the "new customer" event. Each of the above webhooks should have a separate webhook inside Magento.

For this step, please note that you will need to go back and forth with Magento and Hyros to create the webhooks. Inside Hyros, go to

[Integrations → Magento → Settings → Integrations → Magento](https://app.hyros.com/#/mh/external-services/cart-integration/magento)

.

6

## Install Universal Script

Please ensure that the following Universal Tracking Script is attached in the header code of your website pages:

7

## Allow OAuth Access Tokens

To enable OAuth Access Tokens in your configuration, navigate to the "Stores" section and click on "Configuration". In the configuration settings, locate the "Services" dropdown and choose "OAuth" from the options. Within the "OAuth" settings, find the "Consumer Settings" option and set the value for "Allowing OAuth Access Tokens" to "Yes". This will enable OAuth Access Tokens in your configuration.

This concludes the setup. We recommend running a test on your end using our testing app

[HERE](https://docs.hyros.com/hse/)

. If you are not able to run a successful test please reach out to the support team.

---

## Verify & Troubleshoot Sales

[Troubleshooting Sales](./manual-testing.md) — Confirm Tracking & Troubleshoot Sales

---
