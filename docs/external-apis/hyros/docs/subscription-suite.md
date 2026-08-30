---
title: "POWER FEATURE : Subscription Suite"
source: "https://docs.hyros.com/docs/subscription-suite"
seccion: "Learning Hyros"
capturado: "2026-08-30"
---

# POWER FEATURE : Subscription Suite

Subscription suite represents a foundational component for businesses operating under a subscription-based model. This powerful feature enables you to link this back to your ads to determine which campaigns are driving higher subscription rates.

## How This Feature Grows Revenues (VIDEO DEMO)

At this moment in time, this feature is only accessible for Clickfunnels 2.0 and Stripe. In the near future, we will expand our portfolio that will process subscription tags.

---

#### What subscription data Hyros stores

In **Sales Data**, you can see every subscription with full lifecycle visibility:

- Trial starts — when each subscription began
- Trial conversions — which trials converted to paid
- Trial cancellations — which trials canceled before converting
- Subscription cancellations — which paid subscriptions later canceled
- Total subscription revenue — cumulative revenue per subscription over time

This data is automatically pulled from your payment processor and tied back to the original ad source.

---

#### Tracking subscription performance in Reporting

In the **Reporting** section, you can analyze subscription stats alongside your standard ad metrics:

| Metric | What it tells you |
| --- | --- |
| **New Trials** | How many free trials were started by an ad |
| **Converted Trials** | How many of those trials converted to paid subscriptions |
| **Canceled Trials** | How many trials canceled before converting |
| **Canceled Subscriptions** | How many paid subscriptions later canceled |
| **Total Subscription Revenue** | Cumulative revenue from subscriptions linked to that ad/source |

---

**Reading the data — Example**

Imagine you spend **$1,000 on Facebook ads** and generate **10 free trials**:

| Check-in | What you see |
| --- | --- |
| **Day 1** | 10 trials started, $1,000 ad spend |
| **Day 14** (trial ends) | 6 trials converted to paid, 4 canceled — **60% conversion rate** |
| **Month 6** | 2 of the 6 paid subscriptions canceled, 4 still active — **$X total revenue** generated so far |

Now compare across sources:

| Source | Trial Conversion Rate | 6-Month Revenue | Verdict |
| --- | --- | --- | --- |
| **Google** | 75% | $4,500 | Strongest long-term ROI |
| **Email** | 65% | $3,800 | Solid converter |
| **Facebook** | 60% | $3,000 | Decent baseline |
| **TikTok** | 25% | $700 | High churn — investigate or cut |

Source-level differences in trial conversion and long-term retention can be dramatic — and they're invisible without subscription tracking.

---

#### Forecasting future subscription revenue

Hyros uses your **past customer data** (from Stripe, Shopify, etc.) to predict the future revenue of new subscriptions.

Example:

You spend $1,000 and acquire 10 new subscribers paying $100/month. Based on your historical retention and churn data, Hyros forecasts that each subscriber will likely generate an **additional $800 over the year** — meaning your true ad ROI isn't 1x ($1,000 of immediate revenue) but closer to **9x** ($9,000 forecast over 12 months).

Use FORECASTING to predict how much revenue your subscriptions can generate. For more details follow this guide:

[LTV Forecasting](https://marketplace.gohighlevel.com/docs/ltv-forecasting)

---

## FAQ

#### Where can I see the subscription events in hyros?

Subscriptions events can be seen in [**CRM**](https://app.hyros.com/sales-data/sales) and [**Reporting**](https://app.hyros.com/reporting) tab.

You can visit the Subscriptions tab to see your live subscriptions data per lead, from [**Sales details -> Subscriptions**](https://app.hyros.com/sales-data/sales):

Alternatively, you will be able to view the details of your subscriptions data directly in a report by going to [**Reporting**](https://app.hyros.com/reporting), selecting the type of report you want (e.g. Last Click) and going to Subscription details:

Go to Reporting and select the type of report you wish

##### **What type of data do we have for Subscriptions?**

The following data are available:

- Start Date
- Name of the Product
- End Date
- Lead Email
- Status: Active or Trialing
- Source: Stripe or Clickfunnels 2.0
- Automatic Canceled At
- Trial Start
- Trial End

#### What extra subscription information is tracked from stripe inside Hyros?

Hyros can also read from Stripe certain subscription information. Currently the Stripe integration will allow you to visualize the following information in your reports:

- New Trials
- Converted Trials
- Canceled Trials
- Canceled Subscriptions
- One Time Sales
- New Subscriptions
- New MRR
- Direct Subscriptions
- Trial CVR
- Churn Rate

You will also be able to see when a subscription starts or ends inside the lead journey. This is represented by the [**#tag**](https://docs.hyros.com/docs/tags) in a lead's journey.

To read more about how tags work and what they mean, please see [**THIS GUIDE**](https://docs.hyros.com/docs/using-tags).

#### What do subscription statuses represent?

Subscription statuses help you understand the current state of each subscriber:

- **Incomplete** - This status occurs when a subscription is first created, but the initial payment is pending. It usually happens when the subscription requires a payment method and the customer hasn't yet provided one or the payment failed.
- **Incomplete_expired** - This status is the state a subscription reaches when the initial payment to start the subscription fails. In that case, the subscription first goes into the `incomplete` state. If the payment isn't completed within 24 hours, the subscription moves to the `incomplete_expired` state.
- **Trialing** - If a subscription includes a trial period, it will be in the trialing status until the trial ends.
- **Active** - A subscription is considered active when it is successfully processing payments and the customer has access to the service or product.
- **Past_due** - This status indicates that a payment for the subscription is overdue. This usually happens when the automatic payment fails and hasn't been recovered.
- **Canceled** - A subscription is marked when it has been explicitly canceled by the user or the business.
- **Unpaid** - Similar to canceled, but unpaid may keep the invoices open and attempt payments again with a new payment method.
- **Completed** - Is the state that a subscription reaches when it has a finish date.
