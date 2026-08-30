---
title: "API Documentation"
source: "https://docs.hyros.com/docs/api-docs-reference"
seccion: "API & Integrations"
capturado: "2026-08-30"
---

# API Documentation

Connect your custom software with Hyros via API.

**You can Access the Hyros API to connect your software with Hyros [HERE](https://api-docs.hyros.com/).**

You will need developer/technical experience or assistance in order to implement this. Before using the API, please make sure to check that your software does not directly integrate with Hyros by going to our integrations section in the navigation bar. If it does not, you may also be able to connect via Zapier.

This will allow us to receive event data from your software if we do not currently have a direct integration already, and we can not send events into Hyros via

[Zapier](https://marketplace.gohighlevel.com/docs/zapier)

.

If you have any doubts at all about how to connect your marketing stack with Hyros, please reach out to the support team so we can confirm the easiest setup for your stack.

## FAQs

#### Where do I find my API key?

#### How do I collect the Lead ID for the Lead Journey Endpoint?

Using the [**Get Leads**](https://hyros.docs.apiary.io/#reference/0/leads/retrieve-leads) endpoint to retrieve the IDs for each lead is the easiest way of doing this.

That being said, you could also use the lead id from a webhook event, for example, creating a subscription for `sale.attributed` events.

#### What is a valid parameter for the lead ID?

The ids should have the following format: `.....?ids="lead-id-1","lead-id-2"`

If you are seeing an error message such as "invalid value for the parameter Ids", then please ensure you are using the exact format above.

If you are, then please reach out to the support team with a screenshot displaying the error and confirming the exact format of the lead IDs.

#### Get ad attribution endpoint: What fields exactly can be retrieved?

Currently, the following fields are available for the ad attributions endpoint:

- Sales
- calls
- qualified_calls
- unqualified_calls
- cost_per_call
- cost_per_qualified_call
- cost_per_sale
- leads
- cost_per_lead
- total_revenue
- revenue
- recurring_revenue
- profit
- new_leads
- cost_per_new_lead
- roi
- roas
- refund
- refund_count
- refund_sales_percentage
- refund_revenue_percentage
- unique_sales
- cost_per_unique_sale
- cost
- unique_customers
- cost_per_unique_customer
- time_of_sale_attribution
- time_of_call_attribution
- unique_customers_revenue
- net_profit
- hard_costs
