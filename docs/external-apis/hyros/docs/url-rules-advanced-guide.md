---
title: "URL Rules (Advanced Guide)"
source: "https://docs.hyros.com/docs/url-rules-advanced-guide"
seccion: "General"
capturado: "2026-08-30"
---

# URL Rules (Advanced Guide)

URL rules are an easy way to create sources, sales, action tags or lead stages passively if the visiting URLs have distinct words or snippets in the URL.

WARNING

If you’re tracking link clicks sending traffic to your landing page, the best option is to track via THIS GUIDE. This allows you to track more granularly and will provide the most accurate data possible. URL rules are best utilized when you don’t have control over source links. If you have any questions please contact in-app support or the onboarding team.

IMPORTANT PLEASE READ: A few Warnings regarding URL rules

BE VERY CAREFUL TO MONITOR THE RESULTS OF YOUR RULE

If your matched word is in unintended URLS it could attribute the source incorrectly. For example if you use the word “email” as your matched word then people visit a blog post with the URL blog.com/email-guide, all visitors to this guide will get tagged email. Make sure your rule is isolated to unique URLs and instances.

BEFORE SETTING UP A URL RULE FOR ORGANIC FACEBOOK, YOUTUBE OR GOOGLE ETC

Please make 100% sure ad tracking is set up correctly first, otherwise, for example, if a youtube ad is not tracked correctly, the above URL rule will falsely track a Youtube organic click instead of a google ad click. For this reason, when possible it is always safer + more accurate to track via THIS GUIDE, and if that’s not possible, THEN creating a URL rule using the referrer URL will help to avoid this issue if there are specific UTM’s identifying the source (eg “utm_source=youtube&utm_medium=organic” clearly identifies an organic click).

## Overview - How To Create a URL rule

---

### 1. Simple Rule

### Use-Case Examples

**Please see the dropdown below and follow the exact steps to track some of the more commonly found external sources:**

---

### 2. Dynamic Rule

IMPORTANT NOTE! The dynamic rule is especially useful for Email and SMS campaigns, specifically when we want to track the source for each individual campaign separately. Instead of creating a Simple Rule for each campaign we just need to create a Dynamic Rule which will automatically create a source for each campaign inside Hyros.

IMPORTANT: This should not be used as an alternative to ad tracking, for ads you should follow the guide for each specific ad platform to ensure we track your ads correctly, otherwise you will not be able to read your cost data correctly. If the UTM exists on a source click that you have already setup tracking on with Hyros, the URL rule will be ignored.

### Use-Case Examples

---

### Advanced configuration

### FAQ’s
