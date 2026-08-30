---
title: "Acuity Scheduling"
source: "https://docs.hyros.com/docs/acuity"
seccion: "Call Tracking"
capturado: "2026-08-30"
---

# Acuity Scheduling

This guide will show you how to track calls and sales from Acuity Scheduling platform.

1

## Integrate Acuity

#### A. Connect Acuity

1. In Hyros: profile icon → Settings → Integrations → search Acuity → click Acuity Scheduling → Connect Acuity

2. When the Call Tracking URL Rule pop-up appears, click Disable URL Rule

2

## Set Up Acuity Appointments

If you have one thank you page for all appointments then follow the steps from the first section below. If you have unique thank you pages for each appointment separately then please follow the second section below.

### Option A - Using one Thank You page

#### A. Open Custom Conversion Tracking

In **Acuity**: **Integrations** → search **Custom Conversion Tracking** → click **Setup**.

#### B. Install Snippet Code

1. Paste the Custom Conversion Script (from above) into the code input box

2. Inside the script, replace the placeholder URL with your actual thank you page URL

3. Click Save Changes

html

```
<script type="text/javascript">
window.top.location = 'https://yoururl.com?email=%email%';
</script>
```

---

### Option B - Using multiple unique Thank You pages

#### A. Open Custom Conversion Tracking

In **Acuity**: **Integrations** → search **Custom Conversions** → click **Setup** → paste the **Multi-Page Conversion Script** (from below) into the code input box.

html

```
<script>
var bookedAppointmentName = "%appointmentType%";
console.log(bookedAppointmentName)
if( bookedAppointmentName == "Appointment Type 1" ){window.top.location = 'https://yoururl.com?email=%email%';
}else if( bookedAppointmentName == "Appointment Type 2" ){
window.top.location = 'https://yoururl.com?email=%email%';
}
</script>
```

#### B. Get your Appointment Type Names

In **Acuity**: left side panel → **Appointment Types** → copy the exact name of each appointment type you want to track.

#### C. Edit the Script

In the script you pasted in Step 1, replace each placeholder with:

- Appointment Type Name → exactly as copied from Acuity
- Thank You Page URL → the destination URL for that appointment type

#### D. Add more Appointment Types (optional)

The script handles two types out of the box. To add more:

1. Copy the block starting with else if (the last conditional in the script) down to the closing tag

2. Paste it directly after the existing final block

3. Update the new block with the next appointment type name and thank you page URL

Repeat for as many appointment types as you need. Click **Save Changes**.

#### E. Confirm the Universal Script

Every thank you page used in the script must have the **Hyros Universal Script** installed in its header. Without it, the conversion script has nothing to run inside.

3

## Whitelist Appointments and Discard sales processing if needed

If you want to track only specific call events or you don't want to track sales events please follow the steps below.

### If you do NOT want to track all your events

---

### If you do NOT want to track sale events

---

## Troubleshooting

1

## Acuity does not redirect after completing the booking form

First, please go back to the step where you added the script inside Acuity and ensure that the tracking script is installed correctly. If you have confirmed that it is, then it may be a permissions issue with Acuity.

You may be able to confirm this by going to the console tab in your developer tools:

Then you should see an error message that says something like "The current window does not have permission to navigate the target frame to..." below:

If you see this then there are 2 current workarounds to enable the redirect:

#### A. Add a piece of code to the Acuity Embed code to enable the redirect

This is the optimal workaround because you do not have to make any funnel changes. First, copy the code below:

html

```
sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
```

Then find your Acuity embed code and paste the above code between the `

So `

html

```
<iframe sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation" src="https://app.acuityscheduling.com/schedule....
```

Now re-add the new Acuity embed code, reload the page and try again. You should be redirected after booking a call to the thank you page you set in the script that was added inside Acuity.

#### B. Add the Acuity form to its own page, so it's not embedded on any other form

The permissions issue only occurs when it's embedded on a page, so if you just show leads the direct Acuity form rather than the embedded version, the redirect should work.

However if you don't want to make funnel changes we suggest following the first option.

---

2

## I don't see the email on the thank you page

If the redirect works but you do not see the email correctly on the thank you page URL, then it is most likely an issue with the code added inside Acuity.

Go back where you added the script inside Acuity and check the code installed, and ensure the email UTM is present after the thank you page URL, like this: `?email=%email%`
