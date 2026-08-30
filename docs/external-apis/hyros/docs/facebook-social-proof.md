---
title: "Adding Facebook Parameters Without Resetting Social Proof"
source: "https://docs.hyros.com/docs/facebook-social-proof"
seccion: "Home > Additional Resources"
capturado: "2026-08-30"
---

# Adding Facebook Parameters Without Resetting Social Proof

How to add tracking parameters to Facebook ads while preserving likes, comments, and engagement

## Overview

WARNING:

This is NOT a guaranteed workaround. Facebook can behave unpredictably, but based on our experience so far this should allow you to add parameters without resetting social proof. Please test on an ad first before moving forward with this.

The benefits of tracking correctly should far outweigh that of engagement, so for this reason we would normally recommend following the standard set up for Facebook to add parameters for your ads. However, if you are concerned about this, this workflow should help you.

## Creative Ads

### Step 1: Get the Post ID

1. Instead of duplicating the ad, click **Edit ad**.

2. Go to the **Share** button and select **"Facebook Posts with comments"**.

3. Click on the **date** of the post.

4. Copy the **ID** below. Essentially, you have to copy the string of numbers before the `?` sign.

Example:

`https://business.facebook.com/allstartinvestor/videos/1150914968918092/?`

In this example above, the string we need to copy is

**1150914968918092**

.

### Step 2: Create a New Ad with Existing Post

- Create a new ad.
- For Ad setup, choose **"Use Existing Post"**.
- Go to the Ad creative section, and click on the **Select post** button.
- Paste the **ID** that you copied earlier in the search field (step 1). If no results are displayed, click on the link provided.
- Now click on the Ad and then hit **Continue**.
- Copy the HYROS Parameters:

text

```
fbc_id={{adset.id}}&h_ad_id={{ad.id}}
```

- Scroll down to the **URL Parameters** in Facebook, paste the HYROS parameters and hit **Publish**.

## All Other Campaigns

### Step 1: Get the Post ID

1. Instead of duplicating the ad, click **Edit ad**.

2. Go to **Preview**.

3. Select **"Facebook Posts with comments"** and copy the post ID from the URL.

The post ID is located at the end of "post/" in the URL here

### Step 2: Create a New Ad with Existing Post

- Create a new ad.
- For Ad setup, choose **"Use Existing Post"**.
- Paste the **Post ID**.
- Copy the HYROS Parameters:

text

```
fbc_id={{adset.id}}&h_ad_id={{ad.id}}
```

- Scroll down to the **URL Parameters** in Facebook, paste the HYROS parameters and hit **Publish**.

## Next Steps

This should keep the social proof on your ads. Do this for all ads you'd like to track, and then continue with the Facebook set up in step 1 of the initial guide.

THIS DOES NOT CONCLUDE THE SET UP FOR FACEBOOK.

You must still complete the full Facebook integration setup to ensure proper tracking.

[Facebook AdsTrack Facebook and Instagram campaignsView guide](https://marketplace.gohighlevel.com/docs/facebook-ads)
