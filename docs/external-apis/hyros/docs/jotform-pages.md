---
title: "Jotform Forms"
source: "https://docs.hyros.com/docs/jotform-pages"
seccion: "Automation & Forms"
capturado: "2026-08-30"
---

# Jotform Forms

This guide covers tracking lead information through application forms and tracking purchases through Jotform's purchase order forms.

## Classic Form

## Written Guide

### 1. Open Form Settings

In Jotform, find your form → click More → Settings.

### 2. Configure Thank You Page

In the left menu, open Thank You Page → select

Redirect to an external link after submission.

### 3. Set the Redirect URL

Enter your Thank You Page URL, then add the email parameter at the end:

https://yourdomain.com/thank-you?email=

### 4. Insert the Email Field Value

Click the gear icon → Fields tab → copy the Email field value token and append it after the equals sign in the URL.

Example format:

https://yourdomain.com/thank-you?email={email}

### 5. Multiple Parameters (if needed)

The first parameter starts with ?; any additional ones start with &.

Example:

https://yourdomain.com/thank-you?email={email}&name={name}&source={source}

### 6. Verify the Field Name

The email parameter key may vary (e.g., email8, emailx). Use the specific email field you selected. After a test submission, confirm the email value appears in the browser URL.

## Card Form (1 Question per Page)

## Written Guide

### 1. Identify the Email Field Name

1. Preview your Jotform form.

2. Open Developer Tools in your browser.

3. Select the email field with Inspect Element.

4. Find the input tag → look for name=....

5. Copy the value after the underscore (e.g., if it’s name=email_123, copy 123).

### 2. Configure the Thank You Page

1. In the Jotform builder, scroll down and select Edit Thank You Page.

2. Choose Redirect to External Link After Submission.

3. Enter your thank you page URL.

Append: ?email={fieldName}

Example: https://yourthankyoupage.com?email={123}

### 3. Enable Post Data

1. Go to Settings > Form Settings.

2. Find Send Post Data → set to Enabled.

### 4. Test the Setup

1. Submit the form.

2. Confirm the thank you page URL shows your email.

3. Verify the email appears in Hyros tracking.

### 5. Troubleshooting

If the email is missing:

Go to Settings > Conditions.

Check all redirect links include the same email parameter.

If still unresolved: contact in-app support or your analyst.

## Track Jotform Sales

[Jotform IntegrationsThis document explains the steps required to link your Jotform account to Hyros for tracking sales events. View guide](https://marketplace.gohighlevel.com/docs/jotform-integration)
