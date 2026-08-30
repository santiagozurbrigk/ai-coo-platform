---
title: "Snapchat Ads"
source: "https://docs.hyros.com/docs/snapchat-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Snapchat Ads

This guide will walk you through integrating your Snapchat Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

STOP

– Do you use other tracking platforms?

**If you have used Wicked Reports, Triple Whale, Northbeam or similar tracking systems we can use your EXISTING tracking UTMs.**

Skip this guide.

[For Fast Setup follow this link.](https://docs.hyros.com/docs/track-your-ads-for-triplewhale-wicked-reports-users)

1

## Integrate Snapchat Ads

#### A. Connect Snapchat Ads in Hyros

1. In Hyros: profile icon → Settings & Setup → Integrations → Snapchat → Connect Snapchat [Snapchat → Connect Snapchat](https://app.hyros.com/external-services/snapchat/accounts)

2. Name the integration, sign in with Snapchat, select the correct organization and ad account, and click Save

2

## Install Snapchat Parameters

#### Snapchat Parameter

text

```
?snc_id={{adSet.id}}&h_ad_id={{ad.id}}
```

#### A. Install Tracking Parameter

In **Snapchat Ads Manager**: open the ad → click **Edit** → scroll down → paste the Hyros parameter → **Save**.

💡 **Some ad types (like Dynamic Product Ads) can't be edited.** If the Edit option isn't available, **clone the ad**, add the parameter to the clone, and publish.

---

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### Missing campaigns?

This is especially useful if you have any awareness campaigns where a call to action button is not present or traffic isn’t being sent to your landing page.

Normally, as soon as a click event is tracked from an ad, it is automatically imported into Hyros along with the costs and other relevant information. However, if there is no click event to be tracked, you will need to import the ad manually into Hyros in order to receive the costs from that source.

_NOTE: This will NOT enable you to track view through conversions or associate any ads without a call to action button with purchases. It WILL allow you to track the costs associated with the ads._

To configure this, simply go to your Snapchat integration, click configure and click “Import” as shown here
