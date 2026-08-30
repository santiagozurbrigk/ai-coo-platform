---
title: "CallRail"
source: "https://docs.hyros.com/docs/callrail"
seccion: "Call Tracking"
capturado: "2026-08-30"
---

# CallRail

This document will show you how to track calls with CallRail integration.

In order to complete this integration, "Form Tracking" Add-on must be enabled on your CallRail plan. CallRail's Form Submission webhook field will not appear in your account until Form Tracking is activated. This is an add-on that can be added to any CallRail plan for an additional fee.

In this document, you will find how to track calls with CallRail integration. The first video will show you how to make the integration and connect the Webhook.

The second video below will show you how to track direct calls using CallRail with Hyros.

If you need any help, contact support or your onboarding manager. We are standing by!

## Standard CallRail Setup

Please keep in mind that every call answered is considered a Call sale in Hyros.

#### A. Connect CallRail and Copy Webhook

1. In Hyros: profile icon → Settings → Integrations → search CallRail → click it → Connect → name the integration → Add Integration

2. Click the gear icon (Actions tab) → Get Webhook → copy the webhook URL

#### B. Install Webhook

In **CallRail**: from the main dashboard → search for **Webhooks** (top-right) → paste the Hyros webhook into **both** fields:

- Post Call
- Form Submission

Click Save.

What if the Lead does not enter an email?

In some cases with CallRail, leads may not enter an email when booking a call, but just a phone number. Although normally Hyros needs an email to track a call, in this specific case if the email is not available we can still track the call using the phone number only as long as you have integrated correctly following the steps mentioned above.

Inside Hyros you will still see an email, as all tags must be attributed to an email inside the app, however it will be a customized email based on the phone number of the lead, should no email be present.

For example, if a lead's number is 1234567, then the call sent from CallRail will be shown inside Hyros attributed to the lead email "[1234567@callrail.com](mailto:1234567@callrail.com)".

---

## Tracking Direct Calls

#### Hyros Snippet

html

```
<div data-calltrk-noswap style="display:none">
  <a class="external-dni" href="tel:+1112223333"> 111-222-3333 </a>
</div>
```

#### A. Create a tracking number in CallRail

In **CallRail**: search for **Tracking Number** → click **Create Number** → configure with:

- **Use**: On My Website
- **Tracks**: Calls, Keywords, and Web Sessions
- **Visitors**: Track All Visitors
- **Swap Target**: the phone number currently displayed on your website (the one CallRail will replace)
- **Number Pool Size**: follow CallRail's recommendation based on your website traffic
- **Name**: anything you like

Under **Call Routing**, choose the number you want the calls to be forwarded to.

Click **Activate the Tracking Number**.

#### B. Install the CallRail JavaScript snippet on your site

1. In CallRail: left menu → Integrations → search JavaScript Snippet → click it

2. Click Copy to Clipboard → add the snippet to the body of every page on your site

3. To verify installation, copy any page URL from your site and paste it into CallRail's test field

#### C. Install Hyros Snippet to your Direct Call Button

CallRail needs a separate snippet on every **direct call button, contact link, form, div, or iframe** where your phone number is embedded. This is what swaps in the tracking number dynamically.

**The snippet** _(found below the video)_ uses your forwarding number in two places. Replace **both** with your actual forwarding number, matching these exact formats:

- First number (tel: attribute) — country code prefix, no spaces, dashes, or parentheses (e.g. +11112223333)
- Second number (visible text) — dashes between segments (e.g. 111-222-3333)

#### D. Add your Real Numbers to Hyros

In **Hyros**: **profile icon** → **Settings** → **Tracking** → **External Call Tracking** → paste each of your **real business numbers** (with country code) → click **Add**. Repeat for every business number you use.
