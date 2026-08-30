---
title: "Using Tags To Track Customers and Viewing their Journey"
source: "https://docs.hyros.com/docs/using-tags-to-track-customers-and-viewing-their-journey"
seccion: "General"
capturado: "2026-08-30"
---

# Using Tags To Track Customers and Viewing their Journey

This guide will show you how to use tags to organize and track your customers’ journeys.

At HYROS, we track your customers using 4 different tags. It is important that you understand the difference between these tags because they all represent very different things.

---

#### The 4 Tag Types at a Glance

| Tag Type | Symbol | What it tells you | Example |
| --- | --- | --- | --- |
| **Source** | `@` | Where a user came **from** | An ad click, organic click, or email |
| **Action** | `!` | Where a user came **through** | An opt-in, payment processor, or store integration |
| **Sale** | `$` | A product purchased (with its value) | A product tag, or a call product (usually value 0) |
| **Subscription** | _(varies)_ | A recurring product | A membership or subscription plan |

---

#### Source tags (@)

Signify **where a user came from** — an ad click, an organic click, or another source like email.

- View them: profile icon → Settings → Tracking → Tags → Source
- Created automatically when a source is tracked — no need to create them manually
- For more detail on your sources, see Tracking → Source Links (covered in a separate guide)

---

#### Action tags (!)

Signify **where a user came through** — a specific opt-in, a payment processor, a store integration, or a specific funnel page.

**Automatically generated** in many cases:

- The clicked tag comes from the Universal Script when an opt-in or email event is first tracked
- Integration tags appear on sales — e.g. a WooCommerce sale applies a WooCommerce sent action tag to the lead

**Manually generated** in some cases:

- Tags for a specific opt-in or page may need to be created via a **URL rule** [_(see the URL Rule documentation)_](https://docs.hyros.com/docs/other-sources)

---

#### Sale tags ($)

Signify **a product purchased**, with a value assigned to each product tag. A call product will usually have a value of 0.

- Created automatically when a sale is sent in — no manual creation needed
- View all products: Tracking → Products — shows each product's name, category, price, and type

---

#### Subscription tags

Signify **recurring products** — memberships, SaaS plans, or any recurring offering. Tracked separately from one-time sale tags.

---

#### Reading a customer journey

Click any lead in a **report** or the **CRM** tab to see their journey. The tags tell the story in order.

**Example journey:**

| Step | Tag | What happened |
| --- | --- | --- |
| 1 | `@` Pinterest | Clicked a Pinterest ad _(came_**_from_**_Pinterest)_ |
| 2 | `!` opt-in | Opted in _(came_**_through_**_an opt-in — auto-applied when the email was tracked)_ |
| 3 | `$` call product | Booked a call _(a call product sale tag)_ |
| 4 | `!` WooCommerce | Purchased via WooCommerce _(came_**_through_**_WooCommerce)_ |

Reading the symbols left to right, you can instantly see: they came **from** Pinterest, **through** an opt-in, booked a call, and bought via WooCommerce.

---
