---
title: "Sending Hyros Purchase Events to your Reddit Pixel"
source: "https://docs.hyros.com/docs/train-reddit"
seccion: "Train Your Pixel"
capturado: "2026-08-30"
---

# Sending Hyros Purchase Events to your Reddit Pixel

This guide covers how to send events back to your Reddit Pixel.

IMPORTANT:

Please note that at this time we can only send the

PURCHASE

events back to your Reddit account for optimization.

---

### Example - How to Edit Your Pixel as Shown in the Video

#### Base Reddit pixel code example

html

```
<!-- Reddit Pixel -->
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_f93yh1owa3uq');rdt('track', 'PageVisit');
</script>
<!-- DO NOT MODIFY UNLESS TO REPLACE A USER IDENTIFIER -->
<!-- End Reddit Pixel -->
```

IMPORTANT:

If you already have a Purchase event within your code there is no need to add it again. You would simply have to add the highlighted ID's within the Purchase event code. If you do not have a Purchase event code then you would have to add it entirely below.

## Modified Reddit Pixel code

html

```
<!-- Reddit Pixel -->
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_gbtrtym9s5de');rdt('track', 'PageVisit');rdt('track', 'Purchase', { email: "<EMAIL-HERE>", externalId: "anUniqueid", itemCount: 2, value: 19.99, conversionId: 'UniqueConversionID', currency: 'USD' });
</script>
<!-- DO NOT MODIFY UNLESS TO REPLACE A USER IDENTIFIER -->
<!-- End Reddit Pixel -->
```

Example Purchase event:

javascript

```
rdt('track', 'Purchase', { email: "alice@example.com", externalId: "anUniqueid", itemCount: 2, value: 19.99, conversionId: 'UniqueConversionID', currency: 'USD' });
```

Keep in mind that you need to create a unique value for each distinct event but you can set it random number or ID the example above.

If you have any questions please reach out to our support team.

---
