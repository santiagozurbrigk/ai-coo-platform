---
title: "Google Ads"
source: "https://docs.hyros.com/docs/google-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Google Ads

This guide will walk you through integrating your Google Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

STOP

– Do you use other tracking platforms?

**If you have used Wicked Reports, Triple Whale, Northbeam or similar tracking systems we can use your EXISTING tracking UTMs.**

Skip this guide.

[For Fast Setup follow this link.](https://docs.hyros.com/docs/track-your-ads-for-triplewhale-wicked-reports-users)

1

## Integrate Google Ads

#### A. Connect Google Ads in Hyros

1. In Hyros: profile icon → Settings → Integrations → Ad Tracking Platforms → [Google → Connect Google Ads](https://app.hyros.com/external-services/google/account)

2. Name the account, sign in with Google, select the ad account you want to track, and click Save

**Don't connect with an MCC / manager account.** Sign in with a Google account that has **admin access** to the specific Google Ads account you want to track. If your ad account isn't listed, it means you're signed in with the wrong Google account or MCC account.

2

## Install Google Ads Parameters

Moving forward, there are two options to complete the setup

**1. Fast Automatic Setup** – With a single click, Google parameters will be automatically applied to all of your ads.

**2. Manual Setup** – You can manually add the parameters to each Google ad yourself.

---

### OPTION A - Fast Setup

The parameters will be included at the ad group level. If you have parameters at the ad level, keep in mind that Google will always give priority to that level.

If that's the case, skip the Fast Setup (Automatic Setup) and manually install the parameters at the ad level by following the steps below

At this point, If you followed the "Option A - Fast Setup" video, the Google setup is complete.

---

### OPTION B - Manual Setup

Always add the Hyros tracking parameters at the same level and in the same place other UTMs. Level prioritization could affect tracking.

Hyros cannot track Google experimental campaigns at this moment.

## (Search, Display, Video, Discovery) Campaigns

**Please note:** If you are running a campaign type that is not listed below, use the tracking template from this setup. This template can be used for all campaign types that are not specifically covered in the guides below.

#### (Search, Display, Video, Discovery) Campaigns - Standard Tracking Template

code

```
{lpurl}?gc_id={campaignid}&h_ga_id={adgroupid}&h_ad_id={creative}&h_keyword_id={targetId}&h_keyword={keyword}&h_placement={placement}
```

This template includes additional parameters for keyword and placement tracking, which are useful for Search, Display, and Video campaigns.

#### A. Add the Tracking Template column

In **Google Ads**: open your campaign → **Ad Groups** → click **Columns** → add the **Tracking Template** column.

#### B. Install the Parameter

In the **Tracking Template** column, click the **Edit** icon for each ad group → paste the Hyros parameter → **Save**.

**Already have UTMs in your ad groups?**

Place the Hyros parameter at the **end**, separated with an `&` (not a `?`) — otherwise the link breaks.

---

## Performance Max, Shopping and Smart Shopping Campaigns

#### PMax/Shopping/Smart Shopping Tracking Template

text

```
{lpurl}?gc_id={campaignid}&g_special_campaign=true
```

Note the '?' instead of '&' at the beginning. This is intentional for Shopping/PMax campaigns.

#### A. Open your Campaigns

In **Google Ads**: **Campaigns** → **Settings** → select your **Performance Max/Shopping/Smart Shopping** campaign → **Edit**.

#### B. Install the Tracking Parameter

You can do this two ways, pick whichever is easier:

- From the campaign edit screen: open Change Tracking Templates → paste the parameter → Apply
- From the campaigns list: in the Tracking Template column, click Edit → paste the parameter → Save

---

## Smart Campaigns

#### Smart Campaign Tracking Template

code

```
?g_special_campaign=true&gc_id={YOUR_CAMPAIGN_ID}
```

For Smart Campaigns, you must manually add the Campaign ID after the "gc_id=" parameter. Replace {YOUR_CAMPAIGN_ID} with your actual campaign ID.

#### A. Open your Smart campaign's landing page settings

In **Google Ads**: **Smart Campaigns** → select your campaign → in the URL section, click **Edit** → **Landing Page** → **Edit**.

#### B. Install the Parameter (with your campaign ID)

1. Paste the Hyros parameter into the URL field

2. Grab your campaign ID from the page URL in your browser's address bar

3. Add the campaign ID to the end of the parameter

4. Click Save

The campaign ID must be added manually. Unlike other Google campaign types, Smart campaigns don't auto-fill this — without it, tracking won't work.

---

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### Missing campaigns?

This is especially useful if you have any awareness campaigns where a call to action button is not present or traffic isn't being sent to your landing page.

Normally, as soon as a click event is tracked from a campaign or ad, it is automatically imported into Hyros along with the costs and other relevant information. However, if there is no click event to be tracked, you will need to import the campaign/ad manually into Hyros in order to receive the costs from that ad set.

_NOTE: This will NOT enable you to track view through conversions or associate any ads without a call to action button with purchases. It WILL allow you to track the costs associated with the Campaigns._

To configure this, simply go to your Google integration, click configure and click “Import Campaigns” inside "account configuration" as shown in the above video.
