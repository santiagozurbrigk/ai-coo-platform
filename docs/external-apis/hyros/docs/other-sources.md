---
title: "URL Rules (Other Random Sources) – Quick Guide"
source: "https://docs.hyros.com/docs/other-sources"
seccion: "Traffic Sources"
capturado: "2026-08-30"
---

# URL Rules (Other Random Sources) – Quick Guide

Use URL Rules to track general organic sources like Google, Facebook, YouTube, Instagram, or other organic channels when manual source parameters aren't applicable.

## Overview

While "Organic, SMS, and Social Visitors" doc is more tailored for detailed tracking of specific sources or links,

URL Rules (Simple Rule)

are useful for tracking general organic sources, such Google traffic, Facebook, YouTube, Instagram, or other organic channels.

For more advanced tracking needs,

URL Rules (Dynamic Rule)

allow for granular tracking, such links or existing parameters. Perfect for cases where parameters are already included, like in affiliate links, email campaigns, or any other links.

## Before Setting Up URL Rules

BEFORE SETTING UP A URL RULE FOR ORGANIC FACEBOOK, YOUTUBE OR GOOGLE ETC

— Please make 100% sure ad tracking is set up correctly first, otherwise, for example, if a YouTube ad is not tracked correctly, the above URL rule will falsely track a YouTube organic click instead of a Google ad click.

For this reason, when possible it is always safer + more accurate to track via the **Organic, SMS and Social Visitors** guide, and if that's not possible, THEN creating a URL rule using the referrer URL will help to avoid this issue if there are specific UTMs identifying the source (e.g. "utm_source=youtube&utm_medium=organic" clearly identifies an organic click).

BE VERY CAREFUL TO MONITOR THE RESULTS OF YOUR RULE.

If your matched word is in unintended URLs it could attribute the source incorrectly. For example, if you use the word "email" matched word then people who visit a blog post with the URL blog.com/email-guide, all visitors to this guide will get tagged email. Make sure your rule is isolated to unique URLs and instances.

## Use-Case Examples

Please see the dropdown below and follow the exact steps to track some of the more commonly found external sources:
