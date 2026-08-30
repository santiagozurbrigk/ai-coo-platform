---
title: "Train Your Pixel"
source: "https://docs.hyros.com/docs/train-pixel"
seccion: "Train Your Pixel"
capturado: "2026-08-30"
---

# Train Your Pixel

Send offline conversions back to your ad platforms for better optimization.

## Important Warnings

Before setting up offline/conversion API attribution, read the following carefully.

WARNING: BEFORE SETTING UP OFFLINE/CONVERSION API ATTRIBUTION READ THE FOLLOWING

A)

While using the HYROS conversion API for attribution is MORE accurate and USUALLY increases performance it is NOT always instant and will reset learning. SPLIT TEST and TEST performance first by only setting it goal or pixel for a few campaigns.

AGAIN DO NOT PUSH PIXEL/TARGETING CHANGE ACCOUNT WIDE UNTIL YOU HAVE CONFIRMED BETTER RESULTS

.

B)

ENSURE in Google that you do not have ACCOUNT wide conversion goals on. If you do this will DOUBLE the conversions entering your account. Set your conversion goal to HYROS conversions OR specific conversion goals.

IGNORING THIS CAN MESS UP AUTOMATED BIDDING RULES. DO NOT USE ACCOUNT WIDE CONVERSION GOALS IN GOOGLE AND OUR API AT THE SAME TIME.

C)

We are here to help HOWEVER YOU are responsible for the results of changing pixels and targeting in your account. Please make sure you know what you're doing before changing your targeting and/or swapping pixels.

Reckless changing of targeting and pixels can result in dips in performance.

D)

Please ensure ads are tracking correctly before continuing. If there are errors you will be pushing back inaccurate data to the ad platform. Please wait until the onboarding team has confirmed tracking accuracy or reach out to support to ensure your ads are tracking correctly.

As you proceed further, you will notice that for almost every type of traffic source you will have two configuration options. You will either have the option to send offline conversions to your existing pixel, or to a completely new separate pixel.

### What is the difference between sending Events to a Brand New pixel and sending Events to an Existing Pixel?

Opting to send the events to your existing pixel, this allows us to "fill in the gaps" of what the Ad platforms are missing so you are getting the full picture in your existing pixel and optimizing around that.

Alternatively, if you decide to send events to a brand new pixel, it will solely rely on data tracked by Hyros. However, this means you will need to wait longer for the new pixel to gather data before you are able to begin testing and ultimately use the Hyros events to optimize around your real data, events are starting from zero in the new pixel.

To start setting up your AI Pixel setup

, follow these guides:

## Platform-Specific Setup

Choose your ad platform to start sending offline conversions.

[Facebook (Meta)](./facebook-meta.md) — Send events to existing or new Facebook pixel

[Google Ads](./google-ads.md) — Send events to Google conversion actions

[TikTok](./tiktok.md) — Send events to TikTok pixel

[Reddit](./reddit.md) — Reddit offline conversion setup

[Snapchat](./snapchat.md) — Snapchat pixel integration

## Advanced Configuration

Custom conversion rules and troubleshooting.

[Custom Conversion Rules](./custom-conversion-rules.md) — Create custom conversion logic

[Troubleshooting AI Pixel](./troubleshooting-ai-pixel.md) — Verify events and debug issues

[AI Pixel FAQs](./ai-pixel-faqs.md) — Frequently asked questions about AI pixel
