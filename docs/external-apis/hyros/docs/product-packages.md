---
title: "Product Packages"
source: "https://docs.hyros.com/docs/product-packages"
seccion: "Organizing Data"
capturado: "2026-08-30"
---

# Product Packages

Learn how to group products into packages for bundle tracking in HYROS.

---

#### What this does

When a customer's recurring charges use **different product tags** in your integrations, Hyros can't automatically link them as recurring.

**Product Packages** let you group those different tags together so Hyros treats them as the same subscription — enabling correct recurring sale tracking.

When you need this:

Use Product Packages when your payment processor or platform sends **different product tags for each renewal** (e.g. February's charge has one tag, March's charge has another).

If your renewals use the **same tag** every billing cycle, Hyros tracks them as recurring automatically — you don't need this setup.

---

#### Why this matters

By default, Hyros marks a sale as recurring only when the **product tag matches** the original purchase.

**Example of the problem:**

| Date | Product Tag |
| --- | --- |
| **February** | `subscription-v1` |
| **March** | `subscription-v2-renewal` |

Even though this is clearly a recurring charge, the **tags don't match**, so Hyros treats them as two separate one-time purchases — under-counting subscription revenue and breaking LTV math.

Product Packages solve this by **treating multiple tags as one subscription**.

---

## FAQs

#### How can I add a product?

To add a product to a Product Package just go to **_Hyros > Tracking > Products_** and click on the **Actions** menu of the product to add, click on **Add to Package** then click on the package you want to add the product to:

#### How can I remove a product from a package?

To remove a product from a Product Package please go to **_Hyros > Tracking > Products > Product Packages:_**
