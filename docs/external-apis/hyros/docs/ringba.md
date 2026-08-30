---
title: "Ringba Integration"
source: "https://docs.hyros.com/docs/ringba"
seccion: "Call Tracking"
capturado: "2026-08-30"
---

# Ringba Integration

**WARNING: Ringba assigns a new number to users as soon as they land on the tracked funnel, meaning each user will be linked to a unique phone number, which we associate with the tracking profile our Universal Script generates. When a sale takes place, Ringba sends Hyros a call event including a target number via the native integration. Hyros keeps this Call record and attributes it to the appropriate Lead based on the unique phone number associated with the user when they land on our funnel.**

## Setup Guide

To integrate the Ringba Inbound Call Tracking software with Hyros, go to **Settings > Integrations**and click on **Connect Ringba**:

After you press the **Connect**button and name your integration, we need to get our API token from Ringba.

To get our access token, please go to **Ringba > Security > API Access Tokens > Add API Access Token**, name your new token and click on **Add** for your unique code to be displayed, copy the code and paste it in the API Token field of your Ringba integration in Hyros.

After we enter the API Token code, the integration will be completed on Hyros. We now need to click on the **Settings**button and get our Ringba Webhook:

After getting the Webhook from our Ringba integration, we need to go to **Ringba > Campaigns** and click on the name of the campaign(s) we want to track, scroll down to the **Tracking pixel**section, and click on _+Add New Pixel_.

Click on Create new, name it, and paste your Ringba Webhook in the URL field, then click on the _Create button_ to complete the process.

## Configure Hyros Call tracking

Next, you need to copy any of your business numbers or support numbers and add it inside your Hyros account. You need to go to the [external call tracking tab](https://ui-test.hyros.com/tracking/external-call-tracking) and paste the phone number in the “Add business number” field, then click save:

Adding your real phone numbers to the “business number” field will ensure that these numbers will not be tracked on your site, but only the routed tracking numbers.

This will prevent miss-attribution issues in the case that Ringba has issues swapping any phone numbers with the tracking number.
