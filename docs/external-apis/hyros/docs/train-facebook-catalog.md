---
title: "Using Hyros Events with Facebook Catalog Campaigns"
source: "https://docs.hyros.com/docs/train-facebook-catalog"
seccion: "Train Your Pixel"
capturado: "2026-08-30"
---

# Using Hyros Events with Facebook Catalog Campaigns

This guide covers how to use Hyros events for your Facebook Catalog Campaigns.

This guide covers how to use Hyros events for your Facebook Catalog Campaigns. This setup can be done after you [follow the Main Setup](https://docs.hyros.com/docs/train-facebook) to send events to the Meta Pixel.

How to Link the Facebook Pixel to Your Catalog

Please follow the steps from Facebook's documentation [**HERE**](https://www.facebook.com/business/help/1044262445604547?id=1913105122334058) to connect your pixel to a catalog.

Please take in mind that Hyros will send the SKU with the sale into Facebook, and use this `content_ids` field. Because Facebook specify that this field for each product should match exactly with the ID of that product inside the catalog, you need to ensure that your ID inside the catalog is the SKU of the product if you want to utilize Hyros events for optimization.

Once you have connected your pixel to a catalog, then you can follow the steps below to set the event to optimize around Hyros events.

This video specifically covers what you need to do if you are sending Hyros events to a separate pixel

However, if you are sending Hyros events to your existing pixel following the main setup guide, you can simply continue to use your existing pixel:
