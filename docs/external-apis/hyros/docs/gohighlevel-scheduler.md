---
title: "GoHighLevel Scheduler"
source: "https://docs.hyros.com/docs/gohighlevel-scheduler"
seccion: "Integrations"
capturado: "2026-08-30"
---

# GoHighLevel Scheduler

This guide will show you how to set up the tracking on GHL Calendars, GHL Forms and Lead Stages.

Please contact support or your onboarding analyst directly if you have any questions about this process.

## GHL Calendars

---

1

## Integrate GHL

#### A. Connect GHL

1. In Hyros: profile icon → Settings → Integrations → search GHL → Connect

2. Name the integration → Next → follow the prompts to authorize

2

## Set Up GHL

#### A. Open Calendar Settings

In **Go High Level**: **Calendars** → click **Calendars** tab → find your calendar → click the **pencil icon** to edit.

#### B. Install Parameter

Go to **Forms and Payment** → find the **Redirect URL** → add the Hyros tracking parameter to the end of the URL → **Save**.

code

```
?phone={{contact.phone}}&email={{contact.email}}
```

#### C. Copy the Universal Tracking Script

In **Hyros: Settings → Tracking → Copy the Universal Tracking Script**

#### D. Add the Universal Tracking Script to the calendar

In **Go High Level**: **Calendars** → click **Calendars** tab → find your calendar → click the **pencil icon** to edit → **Advanced settings** -> **Widget appearance**

Add the script in the **Custom Code**field → Save changes

## GHL Forms (Optional)

---

#### A. Edit Form

Drag and drop an **HTML element** onto the **top of the form**.

#### B. Add the HTML Element

In **Go High Level**: **Sites** → **Forms** → find your form → click **Edit**.

#### C. Install the Universal Script

1. Click the HTML element → click Edit HTML

2. In Hyros: profile icon → Settings → Tracking → copy the Universal Script

3. Back in GHL: paste the script into the HTML element → Save

Repeat for every form.

## GHL Lead Stages (Optional)

---

#### A. Open GHL Integration

In **Hyros**: **Integrations** → find the **GoHighLevel** integration → click **Edit**.

#### B. Access Lead Stage Rules

Inside the integration settings: scroll to **Lead Stages Rules** → click **Lead Stage** to configure tracking.

#### C. Map GHL Tags

For each lead stage you want to track:

1. Identify the GHL tag that represents that stage (e.g. Booked Call, Qualified Lead, Closed Won)

2. Create the corresponding lead stage in Hyros with a matching name
