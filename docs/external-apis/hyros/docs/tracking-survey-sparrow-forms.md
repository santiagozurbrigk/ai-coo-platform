---
title: "Tracking Survey Sparrow Forms"
source: "https://docs.hyros.com/docs/tracking-survey-sparrow-forms"
seccion: "General"
capturado: "2026-08-30"
---

# Tracking Survey Sparrow Forms

To track Survey Sparrow forms, we need to send the email to the page that the lead will be immediately redirected to upon completion. Follow these steps to achieve this:

1) Find the survey you want to track and click “edit survey”:

2) In the form builder, go to the final step of the form and ensure that you have set the “page redirect” toggle on to redirect leads to your own page after completion.

Copy and paste the following in front of your redirect URL:

**?email=**

Then, at the end of the redirect URL field you’ll notice an icon, select it and scroll down until you find the specific question that contains the email input. So in this example the question is labelled “Enter your Email” in the builder, so we want to find that exact question under “Questions” as shown here:

Please be careful not to simply select “email” under the “contact” list as shown here, because this does not pass on the desired email address to the redirect URL:

As long as you select the question that corresponds to the email input, we should be able to track the email correctly on the next page.

Please ensure that the dynamic code generated is added directly after the “=” symbol. The redirect URL should look something like this:

Note the dynamic field added after “?email=” contains an ID. If you want to verify that this is the correct question, click on the email question and see the ID here. This should match exactly:

3) Run a test by filling out the live survey just like a lead would. Once submitted you should be redirected to your specified page. Check the URL that you are sent to and ensure the email is cleanly attached in front of the “=” symbol like this:

4) Check inside leads under the [CRM](https://app.hyros.com/sales-data/leads) of your Hyros account, you should see the same email there after a few minutes.

If you don’t please ensure all of the steps above have been followed exactly and also make sure our universal script is on the redirect page.

Otherwise, you have completed the setup.
