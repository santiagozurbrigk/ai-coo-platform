---
title: "AppointmentCore"
source: "https://docs.hyros.com/docs/appointment-core"
seccion: "Sales Call Funnel"
capturado: "2026-08-30"
---

# AppointmentCore

This guide will show you how to track the calls that were booked from AppointmentCore calendars.

#### A. Access AppointmentCore

In **AppointmentCore**: **Pages and Links** → choose your calendar → click **Edit**.

#### B. Collect Email and Phone

In the **Automations** tab: scroll to **Fields and Web Form** → click **Custom Fields** → enable both:

- Email Address
- Phone Number

#### C. Set Up Redirects

In the same Automations tab:

1. Scroll to Redirects → enter your thank you page URL

2. Scroll to Booking Link Fields → enable "Pass all contact fields on redirect URL"

This appends the lead's first name, last name, email, and phone to the redirect URL so the Hyros script on your thank you page can capture them.

#### D. Confirm Automatic Calls Rule

In **Hyros**: **profile icon** → **Settings** → **Tracking** → **URL Rules** → confirm the **Automatic Calls** rule is listed and active.
