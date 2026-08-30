---
title: "Google EEA 2024 consent"
source: "https://docs.hyros.com/docs/google-eea-2024-consent"
seccion: "General"
capturado: "2026-08-30"
---

# Google EEA 2024 consent

Google has recently updated its EEA services and policies across the European Union to align with the new European regulation on user consent policy.

What does the EEA policy 2024 update actually mean? This typically involves adjustments to data handling practices, privacy policies, and user consent mechanisms to comply with laws like the General Data Protection Regulation (GDPR) and other regional requirements.

In short, what this means for businesses operating in the European Union, is that they have to ask for the consent of users interacting with their businesses. More details cand be found [**here**](https://support.google.com/google-ads/answer/14310715).

In theory, websites should already have a special pop-ups/sections that refer to the fact that the website uses cookies, such as this one:

What we need to do to align with the EEA 2024 update is to add two lines of code that will give the lead the option to accept cookies or ignore cookies.

If you already use CookieBot or CookiePro in your website configuration, there is no need to continue with this process! 

If you are using CookieBot and you are a Shopify user, make sure the setup has been followed as presented here to ensure you don’t have to do anything extra.

For all users except CookieBot and CookiePro users, what you need to do is access the HTML structure in the backend and identify the popup. Once it is identified, we need to add these two lines of code to the form:

`<button onclick="window.hrs.addLeadConsent('GRANTED');">Accept Cookies</button>`

`<button onclick="window.hrs.addLeadConsent('DENIED');">Ignore Cookies</button>`

Once added to the form, the final version should look like this

Although the update does not require big changes, you may need development skills to implement it.

The image above is just an example. You may find the pop-up structure completely different!
