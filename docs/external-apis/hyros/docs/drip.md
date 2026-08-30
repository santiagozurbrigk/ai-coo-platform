---
title: "Drip Integration"
source: "https://docs.hyros.com/docs/drip"
seccion: "Integrations"
capturado: "2026-08-30"
---

# Drip Integration

This guide will show you how to track your Drip email campaigns with Hyros.

1

## Activate UTM paramerters

2

## Create URL Rule

## FAQ

#### Filtering Email and Organic Sources In Reports

You often do NOT want to include email sources on reports because they will take credit for the last clicks on many sales. This will make your ads look like they are not performing since email will take all the credit.

It is also very hard to see the results of email marketing because ads will take a lot of credit as well. Mixing these two traffic sources together can be messy.

We solve this by letting you filter out ads or email/organic sources when viewing reports. Inside Hyros email is treated as an organic source by default.

You can use this filter to view both, just email or just ads. This will give you a much clearer view of how email and ads are working on their own and together.

#### Pixel Warning: Potentially Violating Personal Data Sent To Facebook

Note that one of our email parameters may trigger this warning if the Facebook pixel is on the same site:

From experience, we have not been able to confirm any cases where this has caused any major issues so far.

Our current interpretation of this is that Facebook are just warning you that they can not use that data, which they never did in the first place. This data is used by Hyros only, so ignoring this should be fine.

HOWEVER please take this as an interpretation only, we can not predict Facebook's behaviour with certainty. This is your responsibility, and if you want to be safe then there are 3 solutions for you to choose from:

1. Go to your pixel settings and under "automatic advanced matching" open up the advanced options and toggle off any information that has been flagged by Facebook (this can negatively effect your event match quality):![](https://docs.hyros.com/wp-content/uploads/2020/02/Auto-advanced-matching-turn-off-info.png)

2. Remove the parameter causing the issue. For example, if it is the "he=" parameter, then remove that parameter from your email links and just use the "el=email" parameter or UTMs to track your sources.
Please see the explanation on what the "he" parameter does under the "How does tracking work?" dropdown for more information.

3. Remove the pixel from your site

#### If you don’t see your email

1. If you haven’t done so yet, make sure you follow the funnel steps and submit an email).

2. Make sure the universal script is added to all your pages, including on the page where you entered your email (such as the opt-in or checkout page).

#### If you see the email, but no @source tag in the journey

1. Check the UTMs are being passed on correctly to the URL after clicking on an email link.

2. Ensure the URL rule you set up in step 2 is added correctly. Check for typos in the “URL parameter” field; it must match exactly with the UTM in the URL.

3. Ensure the landing page has the Hyros Universal script attach

#### How tracking email works

This step is optional, as tracking the source click is already done by the URL rule you set up in the previous step. If you decide you don’t need to do this, please move to the next step to test your email tracking.

What does this do?

This step is used to optimize tracking by passing on the lead email when they click on a call-to-action link in one of your emails.

The reason this might be needed is that although Hyros is very effective at tracking leads across multiple devices over a long time period, there may be some rare cases, as described here, that cause attribution to fail:

If you’d like to set this up for optimized tracking, please see the below:

Adding the parameter

Please copy the following code for Active Campaign: ?he=%email%&el=email

And add this is directly on the call to action link itself on each of your emails.

So for example if your call to action link is the following:

www.yourlandingpage.com

Then add the above parameter manually to the end of the link like this:

www.yourlandingpage.com?he=%email%&el=email
