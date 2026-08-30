---
title: "Connect an AI Agent"
source: "https://commasdocs.com/#ai-agent"
seccion: "Herramientas y referencia"
ancla: "#ai-agent"
capturado: "2026-08-30"
---

AI AGENT

# Connect an AI Agent

Supercharge your Commas workflow with AI. Connect any MCP-compatible AI agent — **Claude**, **ChatGPT**, or **Grok** — directly to your account. Ask questions in natural language and get instant answers about your products, transactions, customers, and subscribers.

AI Dropdown Button

Open in AI Assistant

[Open in ChatGPT](https://chatgpt.com/?q=Read+from+https%3A%2F%2Fraw.githubusercontent.com%2Fotniel-bit%2Ffbnewapi%2Fmain%2Fapi-docs.md+so+I+can+ask+questions+about+the+Commas+API.+I+am+a+seller+on+Commas+and+want+help+understanding+my+products%2C+transactions%2C+customers%2C+subscribers%2C+and+discount+codes.)

[Open in Claude](https://claude.ai/new?q=Read+from+https%3A%2F%2Fraw.githubusercontent.com%2Fotniel-bit%2Ffbnewapi%2Fmain%2Fapi-docs.md+so+I+can+ask+questions+about+the+Commas+API.+I+am+a+seller+on+Commas+and+want+help+understanding+my+products%2C+transactions%2C+customers%2C+subscribers%2C+and+discount+codes.)

[Open in Grok](https://grok.com/?q=Read+from+https%3A%2F%2Fraw.githubusercontent.com%2Fotniel-bit%2Ffbnewapi%2Fmain%2Fapi-docs.md+so+I+can+ask+questions+about+the+Commas+API.+I+am+a+seller+on+Commas+and+want+help+understanding+my+products%2C+transactions%2C+customers%2C+subscribers%2C+and+discount+codes.)

API Docs for AI

[View as Markdown](https://raw.githubusercontent.com/otniel-bit/fbnewapi/main/api-docs.md)

◆ What can the AI agent do?

Once connected, you can ask things like: _"Show me my top-selling products"_, _"How many active subscribers do I have?"_, _"Look up customer jane@example.com"_, or _"What discount codes are currently active?"_ — and the agent will query your Commas data in real time.

🤖 Natural Language Queries

Ask questions in plain English. No API calls, no code, no dashboards — just talk to your data.

🔒 Scoped & Auditable

The agent can both read

**and write**

— charging customers, issuing refunds, creating discount codes, changing subscriptions. Everything runs under your API key's scopes, so restrict the key if you want read-only behaviour, and confirm write actions before approving them.

⚡ 38 Built-in Tools

Products, customers, transactions, subscribers, discount codes, checkout sessions, webhooks and proration — queryable instantly, plus write actions like charges, refunds, discount management and subscription changes.

🔑 Your Data Only

Scoped to your API key. You only see your own account data — never another seller's.

── QUICK CONNECT: DEEP LINK BUTTONS ───────────────────────

── MCP SERVER SETUP ───────────────────

### Commas MCP Connector

Connect your AI directly to your Commas account using the **Model Context Protocol (MCP)**. This gives the AI real-time access to query your data and execute actions through 38 built-in tools.

ℹ Where to find your API key

Go to your Commas dashboard → **Account → API Keys**. Copy your live or sandbox key.

Claude MCP Setup (Collapsible)

**Claude Desktop — One-Click MCP Setup**

Connect Claude Desktop to your live Commas account in seconds. Claude will be able to list products, search customers, view transactions, manage subscriptions, and more — all through natural language.

1

**Download the extension**

One extension for everyone — **no API key is embedded in the file**. You'll enter your key in Claude Desktop after installing.

[Download Extension (.mcpb)](https://marketplace.gohighlevel.com/fanbasis-mcp.mcpb)

2

**Double-click the downloaded file**

Claude Desktop will open and show an install prompt. Click **Install**.

3

**Paste your API key when Claude prompts for it**

During install, Claude Desktop asks for a key in a field labeled **FanBasis API Key** — FanBasis is Commas' former name, so this is expected. Paste your Commas API key (dashboard → **Account → API Keys**); it's stored securely in your device's keychain — it never lives inside the extension file.

4

**Start asking questions!**

Try

_"Show me all my products"_

or

_"List my recent transactions"_

.

ℹ️

Requires Claude Desktop

Make sure you have [Claude Desktop](https://claude.ai/download) installed before opening the extension file. [Download Claude Desktop here](https://claude.ai/download).

**Alternative: Manual config setup**

If the extension file doesn't work, you can configure manually (requires [Node.js](https://nodejs.org) installed):

1. Click to copy the MCP config template

2. Replace `YOUR_API_KEY` with your key from **Account → API Keys**

3. Open **Claude Desktop → Settings → Developer → Edit Config**

4. Paste the config, save, and restart Claude Desktop

Cursor MCP Setup (Collapsible)

**Cursor — One-Click MCP Setup**

Add the Commas MCP server to Cursor in one click. Cursor's AI can then list your products, search customers, pull transactions, and manage subscriptions right from the editor. Requires [Node.js](https://nodejs.org) on your machine.

1

**Paste your API key (optional but recommended)**

From your dashboard → **Account → API Keys**. It never leaves this page — it's only embedded in the local install link.

2

**Click Add to Cursor**

[Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=commas&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJtY3AtcmVtb3RlIiwiaHR0cHM6Ly9oZWFydHktZmxvdy1wcm9kdWN0aW9uLnVwLnJhaWx3YXkuYXBwL21jcCIsIi0taGVhZGVyIiwieC1hcGkta2V5OllPVVJfQVBJX0tFWSJdfQ%3D%3D)

No key yet — the install uses a YOUR_API_KEY placeholder you can edit in Cursor afterwards.

3

**Cursor opens with an install prompt — click Install**

If you skipped the key, open **Cursor → Settings → MCP** afterwards and replace `YOUR_API_KEY` with your real key.

4

**Start asking!**

Try

_"List my Commas products"_

in Cursor's chat.

**Alternative: Manual config setup**

1. Click to copy the MCP config

2. Replace `YOUR_API_KEY` with your key from **Account → API Keys**

3. Paste it into `~/.cursor/mcp.json` (or **Cursor → Settings → MCP → Add server**)

ChatGPT MCP Setup (Collapsible)

**ChatGPT — MCP Setup Coming Soon**

ChatGPT connects to MCP servers via HTTP. Once the Commas remote MCP endpoint is deployed:

1

**Go to ChatGPT Settings → Apps → Add new app**

Paste the server URL: `https://www.fanbasis.com/mcp`

2

**Authorize with your Commas account**

(OAuth login flow)

3

**Use in Developer Mode**

— click

**+ → More → Developer Mode**

→ select Commas

Grok MCP Setup (Collapsible)

**Grok — MCP Setup (Developer API) Coming Soon**

For developers building with the xAI API, add Commas as a remote MCP tool:

```bash
curl https://api.x.ai/v1/responses \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -d '{
  "model": "grok-4-1-fast-reasoning",
  "input": "List my Commas products",
  "tools": [{
    "type": "mcp",
    "server_url": "https://www.fanbasis.com/mcp",
    "server_label": "fanbasis",
    "headers": { "x-api-key": "YOUR_KEY" }
  }]
}'
```

── AVAILABLE TOOLS ────────────────────────────────────────

### Available AI Agent Tools

These read/query tools are available across every connected platform:

| Tool | API Endpoint | Description |
| --- | --- | --- |
| `list_products` | `GET /public-api/products` | List all products with prices and payment links |
| `search_customers` | `GET /public-api/customers` | Search customers by name, email, or phone |
| `list_transactions` | `GET /public-api/checkout-sessions/transactions` | All payments, filterable by product or customer |
| `get_transaction` | `GET /public-api/transactions/:id` | Single transaction details with fees and refunds |
| `list_subscribers` | `GET /public-api/subscribers` | All subscribers across all products |
| `get_checkout_session` | `GET /public-api/checkout-sessions/:id` | Checkout session config and pricing |
| `get_session_transactions` | `GET /public-api/checkout-sessions/:id/transactions` | Transactions for a specific session |
| `get_session_subscriptions` | `GET /public-api/checkout-sessions/:id/subscriptions` | Subscriptions for a specific session |
| `get_product_transactions` | `GET /public-api/products/:id/transactions` | Transactions for a specific product |
| `get_product_subscriptions` | `GET /public-api/products/:id/subscriptions` | Subscriptions for a specific product |
| `list_discount_codes` | `GET /public-api/discount-codes` | All discount codes with usage stats |
| `get_discount_code` | `GET /public-api/discount-codes/:id` | Single discount code detail |
| `get_customer_payment_methods` | `GET /public-api/customers/:id/payment-methods` | Customer's saved cards (last 4 only) |

⚠ Write actions also available

Beyond the read tools above, the MCP server can also perform **write** actions — charging a customer, refunding a transaction, creating products, creating and previewing subscription payment links, creating/updating/deleting discount codes, managing webhooks, and extending, upgrading or cancelling subscriptions.

Charges, refunds, cancellations, upgrades and every delete require an **explicit confirmation step** before they execute. Two do not: `extend_subscription` (which moves a billing date) and `add_api_key` run immediately, so treat an agent request to extend a subscription as final.

── EXAMPLE CONVERSATIONS ──────────────────────────────────

### Example Conversations

Once connected, try these prompts with any AI agent:

📊 Sales Summary

"Give me a summary of my sales this month"

👤 Customer Lookup

"Look up customer john@example.com and show his purchases"

🏷️ Discount Analysis

"Which discount codes have been used the most?"

🔄 Subscriber Report

"Show me all active subscribers to my Pro Monthly plan"
