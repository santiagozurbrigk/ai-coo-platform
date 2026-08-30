---
title: "Zapier with Calendly"
source: "https://docs.hyros.com/docs/zapier-calendly"
seccion: "API & Integrations > Zapier Integration > Tracking Calls"
capturado: "2026-08-30"
---

# Zapier with Calendly

Connect Calendly bookings to Hyros using Zapier for call tracking.

When Do You Need to Track Calls with Zapier?

Most of the time, you should be able to track calls simply by following our initial setup documentation [**HERE**](https://docs.hyros.com/docs/calendly). There is no need to use Zapier for call tracking.

The most common reason to track calls with Zapier

is when you are using **appointment setters**. If they are setting calls manually, and the lead is not booking the call themselves, then tracking calls via the normal flow will track your appointment setter and cause attribution issues.

Zapier helps us work around this by sending the call without tracking the appointment setter.

1

## Remove Tracking Redirect for Appointment Setters

Ensure your appointment setters are

NOT

being redirected to a tracked page after they book a call.

If you have any redirect URLs set up in Calendly for after booking confirmations, make sure appointment setters bypass these tracked pages.

2

## Ensure Matching Emails

Ensure your appointment setters use the lead's

opt-in email

when booking a call.

Because we are not tracking your appointment setters, we are also not tracking the email entered on the form with our universal script that you installed on your site.

This means if the lead originally opted in with the email "LeadOptIn@hyros.com", and then the appointment setter books the call with the email "LeadCall@hyros.com", we have no tracking information to link these 2 emails together.

We rely on the emails matching to track the call correctly. The appointment setter needs to input the same call booking email tracked when they initially opted in, so we can track the call correctly back to the original lead and source.

3

## Setup the Trigger in Zapier

Click the link

[HERE](https://zapier.com/app/zaps)

to access your Zapier account.

Create a new zap, and choose

"Calendly"

app and under the event field select

"Invitee Created"

:

In Zapier, search for "Calendly" trigger app, then select "Invitee Created" trigger event. This will fire whenever someone books an appointment.

Click continue and then log in to Calendly following the prompts.

Select one event from your Calendly account:

You can select a specific event type from your Calendly account to trigger the zap, or leave it to track all event types.

Click continue and test the trigger. If successful, move on to the next step.

4

## Set Up the Action in Zapier

Choose the

"Hyros"

App (Latest version).

Select

"Create Call"

action event:

Search for "Hyros" in the action apps, then select "Create Call" action event.

Click continue and then find the API key from your Hyros account under your profile settings:

Back in Zapier, use these instructions to fill in the event fields:

- **Call Name:** Call
- **Email Address:** Select the "Invitee Email" field from the dropdown
- **Phone Numbers:** Select the field for Phone Number, for example "Questions:Phone Number" (Optional)

Click continue and test the event.

## Verification

You should see the test event inside your sales data tab under calls, which you can find in your Hyros account

[HERE](https://app.hyros.com)

.

Sometimes Zapier events can take slightly longer than usual to be sent into Hyros. If you do not see the test events after 30-60 minutes (to allow for any delays in the data), then please reach out to the support team. Otherwise, this concludes the setup. You can hit the Publish Zap button.
