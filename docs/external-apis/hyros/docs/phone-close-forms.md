---
title: "Easy Mode – Phone Close Forms"
source: "https://docs.hyros.com/docs/phone-close-forms"
seccion: "Payments"
capturado: "2026-08-30"
---

# Easy Mode – Phone Close Forms

If your reps process payments manually, continue with this guide.

## How to use the forms

---

#### Create a Phone Closing form

1. In Hyros: left menu → CRM → Phone Closing → Manage Forms

2. Top-right → Create New Form

3. Copy the generated URL and share it with your sales team

Sales agents can submit sales through the form URL **without logging into Hyros** — no additional accounts needed.

---

#### Track a new sale

Agents use the form URL to log sales. Each submission requires:

- Email — must match the email used to book the call or opt in
- Phone number
- Price

Click **Track New Sale** and confirm to save.

**Note:** The deduplication process of our Phone Close Forms also applies to sales coming from Integrations. If a Sale is registered with a Phone Closing form and the same Sale event is sent from a payment processor within the established timeframe (3 hours before to 3 hours after), Hyros will automatically de-duplicate the event. The sale from the integration will be prioritized and the sale from the Phone Close form will be disregarded.

---

#### Adding rebills for recurring sales

If the sale includes recurring payments, mark it as a **rebill** when creating the sale, then fill in:

- Rebill Time Period (e.g. monthly, quarterly)
- Rebill Price
- Number of Rebills

Once saved, you'll see the sale plus all upcoming rebills with their pricing in the sale details.

## Use Cases

---

## Example with initial purchase

## Example without initial purchase

## Recurring Purchases

If you would like to charge the user a recurring subscription, then please note:

Rebill time period:

how often the sale will be created. If Month is selected, and number 1 is entered, the rebills will be generated every 1 month

Number of rebills:

How many rebills will be charged. The first charge does not count rebill.

So for example, if you want to charge the customer every month for 12 months, you should select the following:

Rebill time period = 1 Month

Number of Rebills = 11

## FAQ

#### How to use the forms when there is a mismatch between the CALL booking email and the purchase email?

**Example: A person clicks on "@fbad" and then books a call under "**[**CallBookingemail@example.com**](mailto:CallBookingemail@example.com)**" and then on the call they Purchase "$Hyrosproduct" at 12:00, and ask the sales rep to use "**[**Purchase_email@hyros.com**](mailto:Purchase_email@hyros.com)**" with the sale.**

If you are tracking sales via an integration such, then depending on the flow "$Hyrosproduct" will be attributed to "[Purchase_email@hyros.com](mailto:Purchase_email@hyros.com)" and we may not detect that this is the same person as "[CallBookingemail@example.com](mailto:CallBookingemail@example.com)". This is an issue because we will not be able to attribute this sale back to the original email and therefore the ad click. We will instead have 2 different leads in Hyros with the following tags:

[CallBookingemail@example.com](mailto:CallBookingemail@example.com) – @fbad, $call.

[Purchase_email@hyros.com](mailto:Purchase_email@hyros.com) – $Hyrosproduct

Entering the above call booking email and the Purchase email, just exactly in the screenshot below will tell Hyros this is the same person so we know "$Hyrosproduct" should be attributed to "@fbad".

Also in this example, Hyros will detect the pre-existing sale already applied to the lead at 12:00. Because the time of sale here is entered at 12:25, a new sale will not be generated:

#### How to revoke a member's access using the phone close forms?

If, for any reason, they want to revoke a particular team's access, they can simply deactivate the link.

#### How does currency conversion work with phone close forms?

The price entered for the product inside the form will be read by Hyros in your inbound currency set in your true tracking settings, and then converted inside Hyros to the Hyros currency.

For example, if your inbound currency is set to USD and your Hyros currency is set to Euros, then if you enter the value of 100, we will read that in USD and then convert it to GBP inside your account.

See [**HERE**](https://docs.hyros.com/docs/currency-settings) for more information on adjusting your currency settings.

#### Is the Phone Number Prefix Important?

This is very rarely important and should not be worried about. If the prefix of the number entered does not match with the lead's number that we originally tracked, then they will be considered different phone numbers in our system. That being said, sales will be tracked correctly anyway via the email's entered on the form, so please do not worry about the phone number matching exactly.

That concludes the setup, if you have any more questions please reach out to the support team.
