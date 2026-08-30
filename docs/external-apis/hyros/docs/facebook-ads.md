---
title: "Facebook Ads"
source: "https://docs.hyros.com/docs/facebook-ads"
seccion: "All Integrations > Ad Platforms"
capturado: "2026-08-30"
---

# Facebook Ads

This guide will walk you through integrating your Facebook Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

STOP

– Do you use other tracking platforms?

**If you have used Wicked Reports, Triple Whale, Northbeam or similar tracking systems we can use your EXISTING tracking UTMs.**

Skip this guide.

[For Fast Setup follow this link.](https://docs.hyros.com/docs/track-your-ads-for-triplewhale-wicked-reports-users)

## Important: Read Before You Begin

**The Learning Phase:**

Updating ads resets learning, may reset engagement, and requires re-approval, but performance impact is minimal and tracking ROI outweighs the re-learning.

**Social Proof:** Although Facebook behavior is unpredictable, to reduce the risk of social proof resets, use the alternate guide for adding parameters without resetting engagement instead of Step 1 below. [Follow this guide for the remaining steps.](https://docs.hyros.com/docs/facebook-social-proof)

**Messenger Ads:** For Messenger ads, contact support.

1

## Track Meta Ads - Fast Setup

Prefer to set the parameters manually? Complete the integration process as explained above (without mapping the parameters). Then, follow the instructions at the bottom of this guide.

#### A. Connect Meta

1. In **Hyros**: **profile icon** → **Settings** → **Integrations** → **Meta** → [**Connect Meta** →](https://app.hyros.com/external-services/facebook/accounts) log in with your Meta credentials and grant all requested permissions.

#### B. Enable Tracking for your Ad Account

In the Meta integration, click the **gear icon** → for each Meta ad account you want to track, **toggle the status ON**.

A confirmation pop-up will appear:

1. Click Review and Map

2. On the next pop-up, click I understand. Add parameters automatically.

Hyros will append its tracking parameters to your active ads automatically.

#### C. Repeat for Every Ad Account

1. Toggle the status ON for every Meta ad account you run ads in. Accounts not toggled on won't be tracked.

2

## Facebook Lead Ads

#### A. Open the Facebook integration in Hyros

In Hyros: **profile icon** (bottom-left) → **Settings** → **Integrations** → **Facebook** → **Lead Ads**.

#### B. Subscribe to your Facebook Pages

You'll see a list of Facebook pages. Toggle **ON** the pages you want to track, and **OFF** the ones you don't.

> 💡 **No pages showing up?**
Make sure you have **admin access** to every page you want to track. Then log out of the Facebook integration and log back in to refresh permissions.

> 💡 **Pages are showing but leads still aren't coming in?**
Go to **Meta Business** → **Settings** → **Integrations** → **Leads Access** → select the correct account → click **Restore default access**. Your pages should then appear correctly in the Hyros integration.

> **💡 Permission required to Track Lead ads**
Follow these step to [Enable Leads Access](https://www.facebook.com/business/help/618808448980683)

---

## (Optional) Install the Parameters Manually

Optional Step

If you skipped adding the parameters automatically as described in the **Track Meta Ads – Fast Setup** step, you can follow the steps below to manually install the tracking parameters.

Facebook Parameter

```
fbc_id={{adset.id}}&h_ad_id={{ad.id}}
```

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### Missing campaigns?

**1) Manually Importing Ads and Ad Sets**

This is especially useful if you have any awareness campaigns where a call to action button isn't present or traffic isn't being sent to your landing page.

Normally, as soon as a click event is tracked from an ad, the ad and ad set is automatically imported into Hyros along with the ad/ad set costs and other relevant information. However, if there is no click event to be tracked, you will need to import the ad and ad set manually into hyros in order to receive the costs from that ad/ad set.

_NOTE: This will NOT enable you to track view through conversions or associate any ads without a call to action button with purchases. It WILL allow you to track the costs associated with the ad set._

To configure this, simply go to your Facebook integration and click "Import Ads and Ad Sets":

**2) Whitelisting Ad Accounts**

By default you will be able to view all ad accounts that the facebook account you have integrated with has access to inside your integration. We will not take any data from the ad accounts unless tracking is set up or ad sets are manually imported.

However if you have non disclosure agreements or want to keep ad account names private for any reason, you also have the option to blacklist ad accounts however they will not be removed from the integration:

If you want to use the ad account again inside hyros, you would need to whitelist it.

#### Missing parameters?

**IF your final url does not show the parameter at all make sure you are not using a redirect like**[**bit.ly**](http://bit.ly)**.**

**IF your final url show the parameter in a messy way such as “%%fbc_id%=214234” make sure you did not put a “?” before the parameter AND if you added it to existing UTM make sure you placed “&” before it.**

**IF the parameter will not show after the steps above contact your onboarding rep on Facebook OR use support via the live chat in the lower right hand corner of this page and say “My Facebook ad URL parameters are not working”**

#### Facebook Lead Ads

**I can't find Lead Access in Facebook Ad account**

**Please also make sure we have the right access options enabled by going to your _Meta Business Manager > Integrations > Lead Access_, then select the right account to work on and click on Restore Default Access:**

**How to test Lead Ads?**

**In order to test your Facebook lead ads please follow the procees listed in the Meta documentation**[**here**](https://developers.facebook.com/docs/marketing-api/guides/lead-ads/testing-troubleshooting/)**.**

**Once the test is completed and you have received the “success” status for your Lead Ad, the lead and its source tag should be visible in your Hyros account.**
