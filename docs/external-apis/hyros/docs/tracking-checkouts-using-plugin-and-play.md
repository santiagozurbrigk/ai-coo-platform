---
title: "Tracking Checkouts using Plugin and Play"
source: "https://docs.hyros.com/docs/tracking-checkouts-using-plugin-and-play"
seccion: "General"
capturado: "2026-08-30"
---

# Tracking Checkouts using Plugin and Play

Set up tracking for Plugin and Play checkout pages.

If you are using plug in and play, you will need to add an extra universal script to track any pages hosted on this plugin.

In order to do this though, plugin and play requires its users to setup a custom domain for the checkout page. Otherwise it is impossible to add our third party tracking script on the page to track it correctly.

To do this, just go to settings and then domains:

Create your domain and validate it inside plug in and play:

Once you have validated the custom domain and are using it for your checkout page, copy our universal script and paste it under the "widgets" settings. It needs to be in the javascript widgets under all pages that you are using with plug in and play. This includes any checkout, thank you and upsell pages you may be using:
