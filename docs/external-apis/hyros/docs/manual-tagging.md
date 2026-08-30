---
title: "Import Sales (Manually Tagging Sales)"
source: "https://docs.hyros.com/docs/manual-tagging"
seccion: "Sales Data"
capturado: "2026-08-30"
---

# Import Sales (Manually Tagging Sales)

Use this guide to manually assign sales to a customer in your HYROS account.

## Importing Sales via CSV

To import sales via CSV, you'll need to format your file with the following columns:

- **Email**: The email address of the lead
- **Tags**: The @source tag depending on what you are looking to add to the lead. The most common tag will be the $sale tag for the purposes of uploading sales.
- **Price**: If the row contains a $sale tag, you can indicate the individual price for that sale here. If the row contains a different type of tag you can leave this empty. NOTE: If you have already created the product inside Hyros with a value assigned then that value will be applied automatically unless otherwise specified.
- **Date**: Format-04-12 12:30 (date in YYYY-MM-DD + time, separated by a space)
- **Cost**: If the row contains a $sale tag, you can indicate the individual cost for that sale. This cost will be reflected hard cost for that sale, which can later be excluded in the revenue inside your reports if desired.
- **Currency**: If the row contains a $sale tag, you can indicate the currency code. If not present your default inbound currency will be used.
- **Type**: If the row contains a $sale tag, you can optionally specify if it corresponds to a "SALE" or a "CALL" product. If not present it will be considered sale.
- **Salegroupid** (OPTIONAL): This column is for E-Com businesses or for businesses that have orders with multiple products. In the salegroupid you need to add the orderid and this will help you to group products into one order.

Once you have completed your CSV file, you can upload it by going to the sales tab, clicking "Import Sales" and then "Import CSV". You'll need to ensure each column value is assigned correctly (Column A = email, Column B = tags, Column C = data, etc.).

## Manually Deleting Sales

Was a sale applied to a user by mistake? No problem. To completely delete a sale, check the box in front of the sale and click the Delete sale button.

Another way to delete a sale is to click on the lead's email and open their purchase history. Then find the purchase you want to delete and select the "delete icon button". This will remove the sale from the user, without creating a refund in the system.

## How to Add a New Product

## Manually Refund a Sale

If you'd like the removed sale to be applied refund in your stats, then go to the sales tab, select the sales you wish to remove, and select "Refund sales" below:

These sales will then be registered, and you will be able to see the revenue from that sale in the refund column inside the report.

## Manually Editing Existing Sales

We all know how important flexibility is when taking care of our clients. This manual sale input option will allow us to keep accurate tracking even when being extra flexible with our clients several other scenarios.

The process is quite simple. Go to **Hyros > CRM > Sales** and click on the user's email address to get additional details about their journey:

After that, click on the

Update Sale

button from the Journey Tab to display the editor:

From this window you can edit pieces of data such as

Price, Cost of Goods, Discount amount, Quantity, Sale Date

and activate the toggle to identify the event

Recurring Sale

. After all appropriate fields have been filled, click on

Update Sale

to complete the process:

Please contact your analyst directly if you have any questions regarding this process.

## Import Cost for Sources

**Import Cost for Sources** — Import and manage custom costs for traffic sources in Hyros
