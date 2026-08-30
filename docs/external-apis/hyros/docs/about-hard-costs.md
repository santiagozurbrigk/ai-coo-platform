---
title: "About Hard Costs"
source: "https://docs.hyros.com/docs/about-hard-costs"
seccion: "General"
capturado: "2026-08-30"
---

# About Hard Costs

Hard costs inside Hyros are tracked depending on the specific integration sending us sales. Please note that certain integrations do not send us hard costs, or send us limited hard cost information. In these situations not able to display this information inside of Hyros.

Please see this list below to understand if the software you have integrated with to send sales is also sending us the hard costs data:

## Hard Costs by Sales Integration

## Adding Hard Costs Manually to your Products

Warning about your existing products

Please keep in mind that if you manually update the hard costs for a product or group of products inside Hyros, this will update the cost data for all sales of that product and will not be reversible.

If the software you have integrated with is not able to send Hyros the hard cost information as you like, you also have the option of adding additional hard costs manually per product inside Hyros.

You can either do this for a single product or for a group of products inside the [product tab](https://app.hyros.com/tracking/products) under tracking.

Editing cost data manually per product will cause all sales of that specific product to have the same cost. There is no way to exclude this for specific sales of the same product.

## FAQ

#### How Can I Use this Data in Hyros?

The main use will be inside your [**Hyros reports**](https://app.hyros.com/reporting) or in the chrome extension reporting. By default the important metrics such as total revenue, revenue, profits etc will be based on your gross revenue. However even in these default reports you can still view useful hard cost data in the hard costs and net profit columns:

If you want to view all your report data and metrics based on net revenue specifically, you can toggle on “exclude hard costs” in the advanced options:

This will allow you exclude the hard costs from all metrics within that report, meaning your cost per sale, total revenue etc will all be based on net revenue after hard costs.

You can also do the exact same thing when viewing Hyros data inside your ads manager using the chrome extension:

#### Where Can I View Hard Costs per Sale?

You need to go to CRM -> Sales and you need to go to Edit columns (step 1), select the metrics (such as Cost of goods, Shipping Value or Taxes) and they will appear in the middle of the table (step 3).

Alternatively, if you want to confirm that hard costs have been tracked for a specific sale, then you go to a lead profile and check the “Purchases” tab. You’ll find the hard costs for a specific sale here:

Please note that you will not be able to see a breakdown of the different types of hard costs (such as shipping/taxes etc) here. They will instead all be added together per product and shown here.

Also please be aware **that some hard costs are sent to us at order level. Any costs added at order level will be added together and divided across all line items within that order.**

For example, if you had an order with 5 unique products purchases within it, the total order level costs of $100 would be divided across all 5 products. So inside Hyros you would see hard costs of $20 for each product within that order.

For this reason sometimes the hard cost data per product may not match exactly with the specific costs you see on your back end per product purchased. However total costs should still match correctly so you can make decisions based on your net revenue data.
