---
title: "BetterCart Integration for Shopify"
source: "https://docs.hyros.com/docs/shopify-bettercart"
seccion: "Integrations > Shopify"
capturado: "2026-08-30"
---

# BetterCart Integration for Shopify

Set up HYROS tracking for BetterCart abandoned cart recovery on your Shopify store.

#### Step 1: Access BetterCart Custom Scripts

Inside Shopify, go to

Apps > Better Cart

. Once inside, go to

Settings

, scroll down to

Custom scripts

and click the

New Custom scripts

button:

#### Step 2: Add the HYROS Tracking Script

A pop-up window will appear and you need to select

All Pages

. In the

Name

field give it a name such as "Hyros", copy the Universal script below and paste it in the image. Once you're done hit the

Create

button.

Please use this script and NOT the one from the main Shopify setup:

html

```
<iframe src="https://app.hyros.com/public/tracking/universal?ct=!clicked"></iframe>
```

This will complete your Shopify set up. Move to the next step in this set up document!
