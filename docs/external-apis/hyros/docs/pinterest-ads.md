---
title: "Pinterest Ads"
source: "https://docs.hyros.com/docs/pinterest-ads"
seccion: "Ad and Reporting Integrations"
capturado: "2026-08-30"
---

# Pinterest Ads

This guide will walk you through integrating your Pinterest Ads account with Hyros and setting up the necessary parameters to track which ads your leads originate from.

If you need any help, contact support or your onboarding manager. We are standing by!

STOP

– Do you use other tracking platforms?

**If you have used Wicked Reports, Triple Whale, Northbeam or similar tracking systems we can use your EXISTING tracking UTMs.**

Skip this guide.

[For Fast Setup follow this link.](https://docs.hyros.com/docs/track-your-ads-for-triplewhale-wicked-reports-users)

1

## Integrate Pinterest Ads

#### A. Connect Pinterest Ads in Hyros

1. In Hyros: profile icon → Settings & Setup → Integrations → Pinterest → [Connect Pinterest](https://app.hyros.com/external-services/pinterest/accounts)

2. Name the integration and connect your Pinterest account

2

## Install Pinterest Ads Parameters

#### Pinterest Parameter

text

```
?pnt_id={adgroupid}&h_ad_id={adid}
```

#### A. Access your Pinterest Ad Account

In **Pinterest Ads**: select the campaigns you want to track → go to **Ad** level → select the ads → click **Columns** → add **Destination URL**.

#### B. Install the Parameter to each Ad

For each ad: edit the **Destination URL** → add the Hyros parameter to the end → **Save**. Repeat for every ad you want to track.

**Already have UTMs in the URL?** Add the Hyros parameter with an `&`, not a `?` — using `?` will break the link.

3

## Catalog Campaigns ONLY

Add the tracking parameter in the Third Party Tracking field

#### Catalog Campaigns Parameter

text

```
{unescapedlpurl}&pnt_id={adgroupid}
```

---

## FAQ

#### Prefer using your existing parameters instead of adding new ones?

If you're already using existing parameters to track your ads and don't want to make changes to your active campaigns, you can use our workaround to continue tracking with your existing parameters without making any changes. Simply [**Follow this guide.**](https://docs.hyros.com/docs/utm-parameters)

If you unsure, or need assistance, please contact our Support team or follow the steps outlined above.

#### Missing campaigns?

###### Manually Importing Ads

This is especially useful if you have any awareness campaigns where a call to action button is not present or traffic isn’t being sent to your landing page.

Normally, as soon as a click event is tracked from an ad, it is automatically imported into Hyros along with the costs and other relevant information. However, if there is no click event to be tracked, you will need to import the ad manually into Hyros in order to receive the costs from that source.

_NOTE: This will NOT enable you to track view through conversions or associate any ads without a call to action button with purchases. It WILL allow you to track the costs associated with the ads._

To configure this, simply go to your Pinterest integration, click configure and click “Import” as shown here:
