---
title: "Shopify Migration Step by Step"
source: "https://docs.hyros.com/docs/shopify-migration"
seccion: "Integrations > Shopify"
capturado: "2026-08-30"
---

# Shopify Migration Step by Step

This guide walks you through migrating from another tracking system to HYROS for your Shopify store.

#### A. Start the migration in Hyros

In **Hyros**: **Settings** → **Integrations** → **Shopify** integration → **Migrate Integration** → in the pop-up, choose the correct **tracking domain**.

#### B. Remove the tracking script from Theme Liquid

In **Shopify**: **Themes** tab → **Edit** (edit the theme code) → **Layout** → **theme.liquid** → locate the Hyros tracking script.

Remove the script → **Save**.

#### C. Delete the Hyros custom app

In **Shopify**: **Settings** → **Apps and Sales Channels** → **Develop Apps** → locate the **Hyros app** → click it → **Uninstall App**.

#### D. Disconnect the Hyros custom pixel

In **Shopify**: **Settings** → **Customer Events** → find the **Hyros custom pixel** → click the **three dots** → **Disconnect**.

#### E. Complete the migration in Hyros

Return to **Hyros** → click **Merge**. This completes the migration.
