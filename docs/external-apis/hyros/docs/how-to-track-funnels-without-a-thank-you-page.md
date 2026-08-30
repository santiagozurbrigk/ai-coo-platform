---
title: "How to track funnels without a Thank You page"
source: "https://docs.hyros.com/docs/how-to-track-funnels-without-a-thank-you-page"
seccion: "General"
capturado: "2026-08-30"
---

# How to track funnels without a Thank You page

Typically, the way our tracking setup works, as a rule requires us to always send leads to a thank you page after they have submitted a form with their details, and that thank you page must have Universal script between the header tags so that we track the lead in Hyros.

Yet, there are occasions when we face various scenarios where we’re unable to incorporate a thank-you page, or when we do have one, we’re unable to integrate the Universal script, which can cause us problems in tracking traffic from our funnels.

However, we have a solution that we can implement where we can correctly track the journey and source of a lead through a few easy steps.

Note that in order to implement the solution we will need to access the backend where we have the HTML structure of the website.

First, we need to identify the form in which leads will enter all their information to be submitted. The form should look similar to the structure below.

** Take in mind that this is only an example and that the structure of the form may be different from case to case.

What we need to watch carefully is to check the form between the <body> </body> tags, especially the button tag that is associated with the form we want to track.

Once the button tag is identified, we need to add this line of code: `onclick="window.hrs.addLeadTag('!submitted');"`

**For example:**

If we have a button tag like this <button>, we need to add a line of code like this:

< button `onclick="window.hrs.addLeadTag('!submitted');"`>

The final version looks like this:

This concludes the setup.

## FAQ

#### How will I identify the data in the forms submitted to Hyros?

All leads who submit these forms will receive the action tag !submitted on their journey as in the example below:
