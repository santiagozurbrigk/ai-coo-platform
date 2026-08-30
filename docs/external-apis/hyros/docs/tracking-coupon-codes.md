---
title: "Tracking Coupon Codes"
source: "https://docs.hyros.com/docs/tracking-coupon-codes"
seccion: "General"
capturado: "2026-08-30"
---

# Tracking Coupon Codes

Tracking coupon codes is a great way to understand the effectiveness of your marketing campaigns. With Hyros, you can track coupon codes entered by customers on your website in 2 ways, depending on how the coupon code is applied.

1

## Adding coupon Codes to your URL

#### What this does

Lets Hyros track which coupon or discount codes your customers used — by capturing the code from the URL as a UTM-style parameter during the lead's journey.

---

#### How URL coupon tracking works

Hyros can track coupon codes that appear as **UTM parameters in the URL** on a page your script is tracking.

For this to work, the coupon/discount code **must be included in the URL of a tracked page** during the lead's journey.

Example URL

[https://app.yoursite.com/public/funnel-checkout/?discount=MAIL20](https://app.yoursite.com/public/funnel-checkout/?discount=MAIL20)

Here, Hyros captures `MAIL20` as the coupon code because it's present in the tracked page's URL.

#### Set Up Discount Code Tracking

---

2

## Adding Coupon codes to the HTML

Please take in mind that in order for this method to work you MUST:

1. Be able to edit the discount field code on your site

2. The input must be outside of an Iframe and on a tracked page (aka a page with our universal script attached) so we are able to track field.

You will need to find the input field where users enter the discount code, here is an example:

In order for Hyros to identify the coupon input, you need to add the `hyros-coupon` class to the `input` field. This can be done by editing the HTML of the coupon input.

For example, the `input` field may look something like this:

<input type=”text” placeholder=”Enter your coupon code”/>

You would add the `hyros-coupon` class inside the `<input/>` tag like this:

<input type=”text” placeholder=”Enter your coupon code” `class="hyros-coupon"`/>

---

## FAQ

#### How can I verify that tracking is working?

Go through the funnel as if you were a lead with a discount code. Enter the discount code and make a test Purchase.

You should see your purchase inside [**crm**](https://app.hyros.com/sales-data/sales) with the !action tag corresponding with your discount code in the lead journey.

#### How to use the tag in your reports?

We advise creating action tags for the purposes of discount codes to avoid any issues with taking attribution from other organic sources. However that means to use these tags in your reports the process is slightly different.

When loading a report, click specify attributes and find the “Filter leads with tags” filter and enter the tag you have created for your coupon code there.

This will generate a report based on leads who at some point in their lifetime received that tag, which would allow us to view sales and other events that this specific group of leads made in your report and understand which sources they came from, and at the same time ignore any information from other lead’s who never received that tag (in other words leads who never used that discount code).
