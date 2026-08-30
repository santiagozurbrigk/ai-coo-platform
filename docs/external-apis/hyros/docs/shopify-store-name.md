---
title: "Adding Shopify Store Name to Product Tag"
source: "https://docs.hyros.com/docs/shopify-store-name"
seccion: "Integrations > Shopify"
capturado: "2026-08-30"
---

# Adding Shopify Store Name to Product Tag

Learn how to add your Shopify store name to product tags for accurate multi-store tracking.

## Why Add Store Name to Product Tags?

In some cases we will handle more than one Shopify Store and it is possible we have the same product(s) in several or all of them. This is not a problem from the tracking point of view, however, we need to make sure the products coming from different stores are labeled appropriately.

If we get products with the same name, Hyros is not going to recognize if they are coming from different stores by default. In the case we had a product named "ExampleProduct" then all events with that label would be grouped under the same category which would be inaccurate since they are not coming from the same store.

## Enable Store Name Feature

Please go to

**Hyros → Settings → Integrations**

, click on

**Configure**

below

**Shopify**

and then click on the

**Edit**

button:

Then please scroll down and enable the

**Include Store Name**

feature from the Toggle:

## How It Works

After this feature has been enabled, your products will get the Shopify Store's name added to the label we recognize them with. This means that instead of getting an event with the label "

_ExampleProduct_

" you would get something similar to:

- "ShopifyStore1-ExampleProduct"
- "ShopifyStore2-ExampleProduct"
- "ShopifyStore3-ExampleProduct"

This will group the events in separate categories depending on which store they came from, providing accurate data in your reports.
