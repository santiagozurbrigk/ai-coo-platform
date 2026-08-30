---
title: "TikTok Ads"
source: "https://docs.hyros.com/docs/tiktok-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# TikTok Ads

This guide will walk you through integrating your TikTok Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

STOP

– Do you use other tracking platforms?

**If you have used Wicked Reports, Triple Whale, Northbeam or similar tracking systems we can use your EXISTING tracking UTMs.**

Skip this guide.

[For Fast Setup follow this link.](https://docs.hyros.com/docs/track-your-ads-for-triplewhale-wicked-reports-users)

TikTok now allows us to install parameters to an active ad. Take in mind that updating ads will reset the learning phase and will require TikTok to review and re-approve your ads. This should not dramatically affect ad performance. The ROI gained/saved from tracking ads will greatly outweigh and justify the re-learning.

1

## Track TikTok Ads - Fast Setup

Prefer to set the parameters manually? Complete the integration process as explained above (without mapping the parameters). Then, follow the instructions at the bottom of this guide.

#### A. Connect TikTok Ads in Hyros

1. In Hyros: profile icon → Settings & Setup → Integrations → under Ad Tracking Platforms, click TikTok [→ Connect TikTok](https://app.hyros.com/external-services/tiktok/accounts)

2. Enter an account nickname, sign in with TikTok, grant access to all requested permissions, click Confirm, select the ad account to track, and click Save

3. Click "Review and Map" in the popup, and then "I understand, add parameters automatically"

2

## Lead Generation Ads ONLY

#### A. Enable the Lead Ads webhook

In Hyros: **Settings** → **Integrations** → [**TikTok** → **Settings** → **Webhooks** → toggle **Lead Ads Generation** to **ON**.](https://app.hyros.com/external-services/tiktok/accounts)

---

## (Optional) Install TikTok Parameters Manually

Optional Step

If you skipped adding the parameters automatically as described in the **Track TikTok Ads – Fast Setup** step, you can follow the steps below to manually install the tracking parameters.

#### TikTok Parameter

text

```
ttc_id=__AID__&ttclid=__CLICKID__&h_ad_id=__CID__
```

#### A. Install Tracking Parameter

In **TikTok Ads Manager**: when creating an ad, at **ad level**, scroll to the URL field → paste the Hyros parameter at the end → click **Publish**.

How to attach the parameter

**URL has no parameters?** Start the Hyros parameter with `?`. **URL already has UTMs?** Start it with `&` instead — using `?` will break the link.

## TikTok Shops

[TikTok Shops](./tiktok-shops.md) — This document explains the steps required to link your TikTok Shops account to Hyros for tracking sales events.

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### Missing campaigns?

This is especially useful if you have any awareness campaigns where a call to action button is not present or traffic isn't being sent to your landing page.

Normally, as soon as a click event is tracked from a your ads, it is automatically imported into Hyros along with the costs and other relevant information. However, if there is no click event to be tracked, you will need to import the source manually into Hyros in order to receive the costs from those ads.

_NOTE: This will NOT enable you to track view through conversions or associate any ads without a call to action button with purchases. It WILL allow you to track the costs associated with the ads._

To configure this, simply go to your Tik Tok integration, click configure and click “Import” inside the "About" tab as shown in this example:
