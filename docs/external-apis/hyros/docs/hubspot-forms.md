---
title: "Hubspot Forms"
source: "https://docs.hyros.com/docs/hubspot-forms"
seccion: "Initial Set Up"
capturado: "2026-08-30"
---

# Hubspot Forms

This document provides instructions for tracking leads from embedded Hubspot forms.

If you need any help, contact support or your onboarding manager. We are standing by!

### HubSpot Form Embed Code

Paste the embed code from HubSpot (iframe, div, or hbspt.forms.create format)

Two prerequisites for this to work:

1. The HubSpot form must be **embedded on your own site** — not used as a standalone HubSpot-hosted form

2. You must have already **connected HubSpot to Hyros** (see the HubSpot integration guide if you haven't)

#### A. Copy the Embed Code from HubSpot

In **HubSpot**: **Marketing** → **Forms** → select your form → click **Embed** (top-right) → **Embed Code** → copy the code.

#### B. Convert it to a Hyros-Enhanced Embed in Hyros

1. In Hyros: profile icon → Settings → Integrations → HubSpot

2. Scroll to Get Embed Code → paste the HubSpot embed code into the top field

3. Click Convert into Enhanced Embed Code

A new embed code will appear with the Hyros Universal Script attached.

Using a custom tracking domain?

Select your custom domain from the dropdown before copying. Otherwise, leave it on Default.

#### C. Replace the Original Embed Code on your Site

Copy the **enhanced embed code** from Hyros → on your website, **replace** the original HubSpot embed code with this new one.

Replace the original. don't add the new code alongside it.

Having two versions of the embed on the same page will cause the form to render twice or fail silently. Remove the old code first, then paste the enhanced one.

## Optional Advanced Step

---

1

## Optimizing Hubspot Form Tracking

Why is this necessary?

Although the above steps allow Hyros to track lead opt-ins made via Hubspot forms accurately most of the time, Hubspot forms can prove to be occasionally unreliable. This means in some instances our universal script can not track the lead opt in correctly.

This is generally rare, but if you want to optimize your tracking with Hubspot forms, please follow these steps.

#### A. Adjusting your embed code

You should have already added the Hyros universal script following the standard video guide, however there is an extra piece of code we need to add manually for this purpose.

Please copy the code below:

javascript

```
onFormSubmit: function($form) {
      setTimeout(function() {
        var formData = $form.serialize();
        var redirectURL = "https://domain.thank-you";
        window.location = redirectURL + "?" + formData;
      }, 250); // Redirects to url with query string data from form fields after 250 milliseconds.
    },
```

Then paste it in your Hubspot embed form that you received from Hyros in the Main Setup guide, and ensure you have changed the URL on the code to the thank you page that you want to redirect leads to after submitting the form.

Next, enter your redirect URL between the quotation marks.

When you are ready, replace your current live embedded Hubspot form with this new embed code.

#### B. Ensure the form does NOT redirect to another page upon submission

In the options for your Hubspot form, ensure you have the option to

display a thank you page

when the lead submits a form.

Why can I not select "redirect to another page?"

The extra code we added in the previous step already redirects the lead to another thank you page, so if you select "redirect to another page" here you will over-ride the code you added in the previous step, meaning the form details will not be passed on the URL of the next page.

[HubSpot](./hubspot.md) — This document explains the steps required to link your HubSpot account to HYROS for tracking sales events.

[HubSpot Meetings](./hubspot-meetings.md) — This documentation is for the purposes of tracking your Call events (Meetings) on Hubspot.

## New Section

### HubSpot Form Embed Code

Paste the embed code from HubSpot (iframe, div, or hbspt.forms.create format)
