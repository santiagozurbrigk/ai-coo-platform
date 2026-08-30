---
title: "Typeform Pages"
source: "https://docs.hyros.com/docs/typeform"
seccion: "Integrations"
capturado: "2026-08-30"
---

# Typeform Pages

This document explains the steps required to track lead's email address from Typeform into Hyros.

There are two options for setting up tracking: basic or advanced.

- **Basic setup**, we'll only capture the email address once the lead submits the form. If the email is entered but the form is abandoned, it won't be tracked.
- **Advanced setup**, we'll capture and track the email as soon as it's typed into the field, even if the form is never submitted. This is especially important for users who don't have a thank you page, or have one but can't install the universal script.

1

## Basic Setup

#### A. Open your Typeform's endings

In **Typeform**: select your typeform → **Create** → **Endings**.

#### B. Add the Email Parameter to the Redirect URL

In the **Button Link** section, add `?email=` to the end of your redirect URL, then click the **+** sign to insert the **email field** from your form.

**Example:**

- Before: https://yoursite.com/thank-you
- After: https://yoursite.com/thank-you?email={{email_field}}

URL already has parameters (contains ?)? Use & instead of ? before email=.

2

## Advanced Setup

#### A. Create a Custom HTML tag in GTM

1. In Google Tag Manager: select your account and container → New Tag

2. Tag Configuration: choose Custom HTML

3. Copy the Script below, or In Hyros: profile icon → Settings → Tracking → copy the Universal Script

4. Paste the script into the Custom HTML field in GTM

#### B. Set the Trigger

For **Triggering**: select **All Pages** → **Save** the tag.

#### C. Copy your GTM container ID

In **Google Tag Manager**: copy your **Container ID** (the `GTM-XXXXXXX` shown at the top of the workspace).

#### D. Connect GTM to Typeform

1. In Typeform: select the form you want to track → Connect

2. Search for Google Tag Manager → click Connect

3. Paste your Container ID → Save
