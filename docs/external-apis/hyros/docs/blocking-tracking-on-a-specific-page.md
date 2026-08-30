---
title: "Blocking Tracking on a Specific Page"
source: "https://docs.hyros.com/docs/blocking-tracking-on-a-specific-page"
seccion: "General"
capturado: "2026-08-30"
---

# Blocking Tracking on a Specific Page

This feature can be especially helpful if you have team members inputting payment information or any other information on a customer’s behalf. If, for some reason, they have to do so on a tracked page, this feature will allow them to access the page without being tracked and associated with any of your customers.

## Disabling Tracking

When your agents use the page that has our universal script installed, just ensure they add “?hyros=disabled” at the end of the URL.

Example

For example: [www.checkoutpage.com](http://www.checkoutpage.com)**?hyros=disabled**

If your agents access the checkout page like this, then the universal script will be disabled on the page when they use it.

Remember, if there are other parameters or utms before, please add a “&” instead of a “?”. For example: [www.checkoutpage.com](http://www.checkoutpage.com)?utm_source=example**&**hyros=disabled

## Re-enabling Tracking

When the page is accessed with the “?hyros=disabled” parameter, tracking will be blocked for the user for 24 hours.

If for some reason they need to enable tracking before that period, then they will need to access the same page, but add “?hyros=enabled” instead, so the webpage will look like this:

www.checkoutpage.com?hyros=enabled

This is normally not necessary. After 24 hours tracking will be enabled again automatically.
