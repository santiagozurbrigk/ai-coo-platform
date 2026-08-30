---
title: "Unqualified Call Tracking"
source: "https://docs.hyros.com/docs/unqualified-call-tracking"
seccion: "General"
capturado: "2026-08-30"
---

# Unqualified Call Tracking

Before starting please ensure you are tracking the calls correctly. At its basic level, we will track all calls equally, and you can view data related to calls inside the reports. If you want to separate calls that you consider unqualified from your call stats and exclude them when calculating your cost per call then follow this guide. Take in mind that this feature is for calls only, and does not work for standard sales in Hyros.

---

#### What this does

Configures Hyros to automatically categorize calls as **unqualified** based on a keyword in the destination URL — letting you separate qualified vs unqualified calls in your reports without manual tagging.

Before you start

Send unqualified leads to a **unique URL with a distinguishing keyword or parameter** (e.g. `/unqualified` or `?status=unqualified`).

Hyros identifies unqualified calls by matching this keyword in the URL — so your funnel needs to route unqualified leads to a URL Hyros can recognize.

#### A. Access URL Rule in Hyros

In **Hyros**: **profile icon** (bottom-left) → **Settings** → **Tracking** → **URL Rules** → check the box next to the **Call rule** → **Edit**.

#### B. Add Unqualified Keyword

In **Advanced Settings**: find the **Unqualified Keywords** field → enter the keyword you're using in your URLs (e.g. `unqualified`) → save.

Hyros will now automatically categorize any call matching that keyword as unqualified.

## FAQ

#### Calls aren't being marked as unqualified?

If for some reason a call has not been automatically marked as unqualified that should be, then you can simply select the call and click "Mark as unqualified" inside the "sales data" tab as shown here:

Please note you can also do the same thing directly in a loaded report when deep-diving into specific calls. Just select the call and do exactly the same as above to mark any call as unqualified.
