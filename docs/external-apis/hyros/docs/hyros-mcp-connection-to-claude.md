---
title: "HYROS MCP - Connection"
source: "https://docs.hyros.com/docs/hyros-mcp-connection-to-claude"
seccion: "General"
capturado: "2026-08-30"
---

# HYROS MCP - Connection

This document will guide you through how to set up the MCP connection and use Claude to Read and Write data from Hyros.

**No technical skills needed -> setup is completely Plug and Play.**

How Does Claude Work with HYROS?

Instead of clicking through the Hyros app to build reports or create records manually, you now have the flexibility to work with your Hyros data just by talking to Claude in plain language.

**Two kinds of things it can do:**

1. Read your data (retrieve information)

You ask a question, Claude pulls the answer from Hyros. Examples:

- "Which traffic sources generated the most revenue?"
- "How many sales in the last two months?"
- "Compare May vs June sales"

2. Perform actions (change your data)

Claude can create or update records in your account, not just read them. Examples:

- Create a new lead with a specific email and tag
- Create a sale for a lead using a specific product
- Update customer records, manage data, etc.

For a Claude Enterprise account, each team member should be assigned a 'Scope' (which indicates that a person belongs to a specific team/group), and admins have the possibility to enable MCPs only for users with a specific scope.

For more details please consult the [official guide](https://support.claude.com/en/articles/15537633-authorize-mcp-connectors-for-your-entire-organization) for managing MCP Authorization for Enterprise users in Claude

1

## Set up the Connection

Remote MCP Server URL

[https://mcp.hyros.com/mcp](https://mcp.hyros.com/mcp)

#### A. Open Connectors in Claude

In **Claude**: **profile** (bottom-left) → **Settings** → under **Customize**, select **Connectors**. You'll see the connectors Claude supports.

#### B. Connect Hyros

Locate **Hyros** in the list → click **Connect**. You'll be redirected to the Hyros login page → sign in with your Hyros credentials → **Continue**.

Once authenticated, Claude redirects you back, and Hyros shows as **Connected**.

#### C. Set connector permissions

By default, Claude asks for approval every time it wants to use a Hyros tool. To adjust this, use the permission dropdowns:

- Read-only tools — set to Always Allow if you want Claude to read your Hyros data without confirming each time
- Write/Delete tools — set to Always Allow if you want Claude to perform actions in your Hyros account without confirming each time

---

2

## Claude Prompt Examples for HYROS MCP

---

#### How it works

Once connected, you simply ask Claude a question or give it an instruction in plain language. Claude uses the Hyros tools to retrieve or update the information — no manual report-building or exporting required.

---

#### Examples — Reading data

**Find your top revenue sources**
Ask which traffic sources generated the most revenue. Claude queries your attribution data and returns a breakdown of revenue and sales by source, plus a detailed view of individual source links — no manual report needed.

**Get a sales total for a time period**
Ask how many sales came in over the last two months. Claude searches your account and returns the total for that range.

**Compare two time periods**
Ask Claude to compare May vs June sales. Instead of exporting reports and lining up date ranges yourself, Claude summarizes the comparison (e.g. "May generated 5 sales, June generated 1") with a brief explanation of the difference.

---

#### Examples — Performing actions

- **Create a lead**

Ask Claude to create a new lead with a specific email and tag (e.g. apply the `!call-booked` tag). Claude creates the lead and confirms the tag was applied, that will show up just in a few seconds in your Hyros account.

- **Create a sale**

Ask Claude to create a sale for a lead using a specific product.

Claude asks for missing required info

Since Hyros requires a price for every order, Claude will ask for the price before creating the sale if you didn't provide it. It won't create an incomplete record — it prompts for what's needed first.

Once you provide the missing detail, Claude completes the action and confirms. You can verify the new sale in the lead's journey inside Hyros.

---

#### What else you can do

These are just examples. Through natural language, you can also:

- Retrieve reports and metrics
- Compare performance across time periods
- Create leads and sales
- Update customer records
- Manage your data

…all by asking Claude and letting the Hyros connector do the work.

---
