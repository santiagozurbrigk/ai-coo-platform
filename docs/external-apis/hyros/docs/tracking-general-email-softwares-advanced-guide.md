---
title: "Tracking General Email Softwares – Advanced guide"
source: "https://docs.hyros.com/docs/tracking-general-email-softwares-advanced-guide"
seccion: "General"
capturado: "2026-08-30"
---

# Tracking General Email Softwares – Advanced guide

Do you use any of these email autoresponders: Active Campaign, Braze, Drip, GoHighLevel, Klaviyo or Omnisend? If the answer is yes, skip these steps and look at the standalone documents under the “Tracking Email Marketing” menu button.

1

## Place Our Email Parameter

Setting up email tracking in HYROS is simple. Just follow the steps below:

NOTE: The video below shows a “hemail=” parameter being added to the link. This has recently been updated to “he=” which can be seen in the list of parameters above in step 1.

1. Copy the parameter below depending on your email software that you are using, you can also find a list of email parameters in the tracking area [HERE](https://app.hyros.com/settings/tracking/source-links). Just click EMAIL TRACKING in the top right-hand corner.

2. Paste this parameter at the end of any link in an email you send.

- **Acuity:**`?he=%email%&el=email`
- **Campaign Refinery:**`?he={{contact_email}}&el=email`
- **CleverReach:**`?he={email}&el=email`
- **Drip:**`?he={{ subscriber.email }}&el=email`
- **Earnware:**`?he=[email]&el=email`
- **GetResponse:**`?he=[[email]]&el=email`
- **ConvertKit:**`?he={{ subscriber.email_address }}&el=email`
- **Mailchimp:**`?he=*|EMAIL|*&el=email`
- **Aweber:**`?he={!email}&el=email`
- **Infusionsoft/Keap:**`?he=~Contact.Email~&el=email`
- **Clickfunnels:**`?he=#EMAIL#&el=email`
- **Ontraport:**`?he=[Email]&el=email`
- **Everwebinar/Webinarjam:**`?he={ATTENDEE_EMAIL}&el=email`
- **GoHighLevel:**`?he={{contact.email}}&el=email`
- **HubSpot:**`?he={{contact.email}}&el=email`
- **Kartra:**`?he={email}&el=email`
- **Kajabi:**`?he={{email}}&el=email`
- **Klick-Tipp:**`?he=%Subscriber:EmailAddress%`
- **MaroPost:**`?he={{contact.email}}&el=email`
- **Intercom:**`?he={{email}}&el=email`
- **Iterable:**`?he={{email}}&el={{campaignName}}`
- **SendGrid:**`?he=[%email%]&el=email`
- **SendLane:**`?he=VAR_EMAIL&el=email`
- **Sendy:**`?he=[Email]&el=email`
- **Smartemailing:**`?he={{df_emailaddress}}&el=email`
- **Lemlist:**`?he={{email}}&el=email`
- **Flodesk:**?he={{ [subscriber.email](http://subscriber.email) }}&el=email

EXAMPLE: If you are using Mailchimp you will place “`?he=*|EMAIL|*&el=email`” at the end of any link.

So if your link is “hyros.com” you would add the parameter to make “hyros.com`?he=*|EMAIL|*&el=email`“.

When a user clicks on the link inside their email, the email will dynamically populate inside the URL, for example, “hyros.com`?he=useremail@example.com&el=email`”

This email will then be tracked by our script, and the “email” in the “el=email” will create the @email tag and apply it to the user, therefore tracking the click as a source.

WHEN TESTING the email parameter attached will NOT work outside of the email. You must click on the link INSIDE an email from an inbox, otherwise there will not be an email to populate inside the URL, which will break tracking.

### Want to track events back to a specific campaign?

By default we will track all email clicks under a single `@email` source tags, however if you want to track back to specific campaigns then just change what comes after `el=`.

For example instead of:

hyros.com`?he=*|EMAIL|*&el=email`

We would add this to signify the campaign is called “email campaign1”

hyros.com`?he=*|EMAIL|*&el=emailcampaign1`

This would generate a source labelled `@emailcampaign1` inside Hyros.

Repeat this for each unique campaign.

Some email automation softwares will have a dynamic code to allow you to add the same code such as `el={campaignname}` to all of your links and generate the unique campaign name automatically.

Please consult with your email automation software support if this is something you would like to do.

## Step 2 – Test your Campaign or Flow

Send yourself a test email. Please ensure you send an email rather than just viewing a preview, as the UTMs will not display correctly in a preview.

Click on the call to action link and find the URL. You should see both the standard UTMs and the “he” email parameters attached cleanly in the URL like this:

www.yourlandingpage.com`?he=johndoe@hyros.com&el=email`

Please take in mind some email softwares won’t display the dynamic data as expected in test emails, so you may see slightly different information than you were expecting. The important thing is that the UTMs are present and cleanly attached to the end of the URL.

Go through the funnel and opt in, book a call or checkout as if you were a lead.

After waiting a few minutes you should be able to find your tracked email under [sales data -> leads](https://app.hyros.com/sales-data/leads). Click on the email and you should see the email source attached:

If you see this tracking has been successful!

If you do not see this , please follow the troubleshooting steps below:

**If you don’t see your email**

- If you haven’t done so yet, make sure you follow the funnel steps and submit and email.
- Make sure the universal script is added to all your pages, including on the page where you entered your email (such as the opt in or checkout page).
- Please also check that the “he=” parameter generated the email correctly in the URL after clicking on the call to action link. If not please ensure there are no typos in the code, it’s also possible this is just because it was a test email, some email software’s will not display the correct email during tests.

**If you see the email but no @source tag in the journey**

- Check the “el=email” UTM parameter is passed on correctly to the URL after clicking on an email link.
- Ensure the landing page has the Hyros Universal script attached correctly.

## FAQ
