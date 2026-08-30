---
title: "Ad Level Report"
source: "https://docs.hyros.com/docs/ad-level-report"
seccion: "Docs > Analytics Suite"
capturado: "2026-08-30"
---

# Ad Level Report

Ad Level reporting allows you to view your data at the ad level and make decisions based on your best performing creatives/images.

---

#### Generate an Ad Level report

In **Hyros**: **Reporting** → **Other Reports** → **Ad Level Report** → configure:

1. Date range: the period to analyze

2. Attribution Model: pick the model that fits your analysis

3. Days Range for Discard Attribution (optional): limit attribution to a specific time window

4. Specify Attributes (optional): filter by sources, campaigns, ads, products, tags, or other attributes

5. Advanced Options:

- Exclude leads without sales to focus on ads generating actual purchases
- Filter by product categories or product tags to narrow the analysis

Click **Apply** to generate.

---

#### Using the data to optimize

The Ad Level report is a scanning tool — walk through it looking for patterns:

1. Identify winners — ads with strong ROI, high revenue, and low cost stand out visually in the gallery

2. Spot underperformers — ads consuming spend without generating results

3. Scale the winners — increase budget on the ads driving your best results

4. Pause or replace losers — free up budget for testing new creatives

5. Look for creative patterns — if all your winners share visual traits (color, layout, messaging), your next test should build on those patterns

---

## FAQ

#### Which Ad platforms can I use this report for?

For the initial iteration Ad Level reporting is only available for Facebook, TikTok, Google, Twitter, Snapchat, Bing, Reddit and Pinterest.

#### What do we need to do to track creatives?

For the majority of ad platforms, we should not need to do anything to track creatives because we are already tracking at ad level. Please check step 1 in the initial set up guide and ensure you have followed all of these steps correctly.

Please note not all ad platforms currently allow us to track at ad level, because of this we won't be able to use this type of report for these platforms. For example currently we can not track at ad level for LinkedIn.

#### Why can I not see images for my creatives?

Please take into account we need some time to receive image data from the ad platform once this feature is live. If you do not see any images or notice some are missing initially, then please allow 24-48 hours.

Some ad integrations may also require new permissions to send image data, so if you do not see images please try re-integrating with the ad platform by removing the integration and then adding it again inside your integration settings, and waiting 24-48 hours for the data to be sent into Hyros.

#### How are the LTV metrics calculated?

This is referring to the following metrics for LTV when viewing your ad level data:

These metrics do not take into account the date range selected for the report nor the attribution mode (last click/scientific mode etc).

Because these are LTV based metrics, they are

always based on the first click

.

They by default will calculate the

average LTV of all leads (including leads who have not yet purchased)

who first clicked on that specific ad over the specified timeframe.

To calculate this, we sum up the revenue made over the first 30/60/90 days from the initial ad click and divide it by the number of leads over that timeframe.

If you want to see the LTV for customers only:

click on the advanced options in the report filter and toggle on "exclude leads without sales" here:

This will then show you the LTV for all customers only, and exclude any leads who did not purchase over that timeframe from the LTV calculation.
