---
title: "Organizing Your Sources"
source: "https://docs.hyros.com/docs/organizing-your-sources"
seccion: "General"
capturado: "2026-08-30"
---

# Organizing Your Sources

Learn how to group multiple organic sources under a single traffic source in HYROS, making reporting and source organization easier.

We also recommend using our extra UTM parameters to automatically allow you to add these new organic sources into specific traffic sources, inside of Hyros.

Although this is an optional step, it allows you to better organize and segment your data later based on this information, without having to manually adjust any sources later.

To do this, simply add the following UTM parameter at the end of ?el=yoursource, separated by an & symbol:

code

```
htrafficsource=yourtrafficsourcename
```

So, in an example where we are tracking three separate Pinterest links, instead of just using ?el=pinterestpost1, then ?el=pinterestpost2 etc, we would instead use the following UTM parameters for each link:

code

```
www.mysite.com?el=pinterestpost1&htrafficsource=pinterest
www.mysite.com?el=pinterestpost2&htrafficsource=pinterest
www.mysite.com?el=pinterestpost3&htrafficsource=pinterest
```

As you can see, although in this case we are creating 3 different sources by changing the name slightly after el=, we are including them within the same traffic source, which will allow us to group them together by traffic source in the reports later in a more automated way.
