---
title: "POWER FEATURE : Call & Lead Stages"
source: "https://docs.hyros.com/docs/call-lead-stages"
seccion: "Learning HYROS"
capturado: "2026-08-30"
---

# POWER FEATURE : Call & Lead Stages

Track the progress and quality of leads, calls, and demos entering your pipeline.

## How This Feature Grows Revenues (Video Demo)

## Setup Video Guide

## Use Case Examples and Setups

Lead Stages are a great way of tracking specific events that Hyros does not natively track inside the app. There are lots of different ways of using this depending on your use-case, but some good examples would include:

---

## Tracking Lead Stages

There are 3 different ways of Tracking Lead Stages:

### Method 1 - Directly from your Software Integration with Hyros

If you have any of the below integrations, we suggest using this method to track lead stages:

### Method 2 – URL Rules for Lead Stage Tracking

This is a great option if you have UTMs or parameters in your URL that can be used to identify a specific lead stage.

You can create a dynamic URL to track specific custom stages of a lead's journey by following these steps:

1. Go to your **[URL rules settings](https://app.hyros.com/#/mh/tracking/1)** and click create a new rule.

2. Name it whatever makes sense to you.

3. Rule type should be set to Dynamic.

4. Add the URL parameter that you will be using to determine a lead stage. This will use the value of that parameter to create a custom lead stage. For example in the screenshot below the parameter used is `lead_stage`, so if a lead landed on the page with the URL of "www.hyros.com?lead_stage=subscriptionactivated" we would assign the lead stage "subscription activated". Hyros will be using whatever comes after the `=` symbol of the parameter to create a lead stage. The UTM parameter could be very different for your use case, please ensure you add your unique parameter that identifies the lead stage in the URL here.

5. Select the action type of "Lead Stage".

6. Apply rule to the "Tracked URL".

### Method 3 - Lead Stages via Zapier / the API

This is the most flexible way of tracking lead stages. If the above 2 methods don't work for your purposes, you can connect with Zapier to trigger a lead stage inside Hyros whenever any specific trigger event occurs inside your chosen software, providing your software connects with Zapier.

You can read more about how Zapier works in our

[Zapier integration guide](https://marketplace.gohighlevel.com/docs/zapier)

if you haven't used this before.

Once you have setup the desired trigger, just add the "Create Lead" action for Hyros and enter the lead stage when filling out the necessary details for the action.

If your specific software is not available in Zapier to be used trigger, you can also setup lead stages via our API "Create lead" event in the

[API documentation](https://hyros.docs.apiary.io/#reference/0/leads/create-lead)

, however please take in mind that you will need a developer to assist you with the setup. Just ensure you add the stage field in the API documentation.

---

## Using Custom Columns to View Lead Stages in Hyros

Once you have tracked your Lead Stages a set of custom columns will be created based on the lead stage name you have added.

You can use this inside your reports any time to view the metrics for your specific lead stages. When editing your report columns, just click on "Custom" and select the lead stages that you would like to see your metrics for.

## FAQ

#### How will data appear in reports when a lead navigated through all stages?

Suppose we have a lead that has gone through the lead stage where we marked it and the same lead has also made a purchase where we marked it the Customer stage. In this specific scenario, within the reports we will see the lead counted in both Lead and Customer stages.

Or, in another example, using the same stages, if we have 10 leads marked and only 5 of them made a purchase, the MQL stage will report 10 and the Customer stage will report 5.
