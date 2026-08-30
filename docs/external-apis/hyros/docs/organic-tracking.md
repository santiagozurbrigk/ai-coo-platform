---
title: "Organic Traffic Tracking"
source: "https://docs.hyros.com/docs/organic-tracking"
seccion: "Traffic Sources"
capturado: "2026-08-30"
---

# Organic Traffic Tracking

This document will guide you how to implement tracking to your organic sources to identify where your leads originate from.

#### A. Build the Parameter

Add this to the end of the URL you want to track, replacing `YourSourceName` with whatever you want the source called in Hyros (e.g. `pinterestpost1`, `newsletter`, `organic`):

code

```
?el=YourSourceName
```

Example:

- https://yourpage.com?el=organic
- https://www.hyros.com?el=pinterestpost1

URL already has parameters (contains ?)? Use & instead of ? before el=.

#### B. Use the URL

Share or publish the URL with the `?el=` parameter wherever you want to track traffic from (social posts, newsletters, bios, etc.).

---

## Use-Case Examples

Important: Please note that when we add the custom "el" parameter to any URL link we want to track the source, we need to make sure that the traffic is sent to a page where we have the Universal script, otherwise we will not be able to track the source of leads.

---

## Advanced

[Organizing your sourcesThis doc will show you how to make your reporting look segmented.View guide](https://marketplace.gohighlevel.com/docs/organizing-your-sources)
