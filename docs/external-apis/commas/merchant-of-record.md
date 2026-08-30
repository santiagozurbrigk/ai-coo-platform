---
title: "Merchant of Record"
source: "https://commasdocs.com/#merchant-of-record"
seccion: "Empezar"
ancla: "#merchant-of-record"
capturado: "2026-08-30"
---

# Merchant of Record

Commas acts as the **Merchant of Record (MoR)** for all transactions processed through our platform. This means we handle the legal and compliance side of payment processing — but **you still run your business**. Understanding where our responsibilities end and yours begin helps you get the most out of the platform.

WHAT IS MOR

### What is a Merchant of Record?

A Merchant of Record is the legal entity that processes payments on behalf of sellers. As the MoR, Commas is the **entity of record on each transaction** — meaning we handle payment processing, compliance, and card network relationships so you don't have to.

While Commas handles the payment infrastructure, **you are responsible for delivering your product, managing your customer relationships, and maintaining a healthy account**. Think of it as a partnership: we handle the payment complexity, you focus on building and delivering great products.

🌍 Global Payment Acceptance

Accept payments from customers worldwide without registering your business in each country. Commas handles the legal and compliance layer for your sales.

🧾 Simplified Tax Compliance

Commas collects buyer address information at checkout and provides it in your transaction exports, giving you and your accountant the data needed for tax reporting. Sales tax determination remains the seller's responsibility.

🛡️ Dispute Support

Chargebacks flow into your Resolution Center where you review them and submit your evidence. Commas forwards your response to the card networks and shields you from direct card network monitoring programs like Visa VAMP. Maintaining a low dispute rate is your responsibility.

✅ Built-In Compliance

PCI DSS compliance, fraud detection, and payment routing are all handled by Commas — no additional certifications required from you.

MOR VS PG

### MoR vs Payment Gateway

Many platforms use a **Payment Gateway (PG)** like Stripe or PayPal in "pass-through" mode — where they connect you directly to payment networks but leave you responsible for everything else. Commas takes a fundamentally different approach as a full Merchant of Record.

|  | Commas (Merchant of Record) | Payment Gateway (e.g., Stripe) |
| --- | --- | --- |
| **Tax data & reporting** | ✓ Buyer address collected & exportable | Varies by provider |
| **Chargeback management** | ✓ You submit evidence, Commas handles card network filing | ✗ You manage entirely |
| **Legal liability for transactions** | ✓ Commas assumes | ✗ You assume |
| **International sales** | ✓ No per-country registration required | Requires local business registration per country |
| **PCI DSS compliance** | ✓ Fully included | Partial — you still have compliance obligations |
| **Setup complexity** | ✓ Low — one API integration | High — legal entity setup, fraud tools, compliance configuration |
| **Fraud protection** | ✓ Included | Add-on at extra cost |

ℹ Your responsibilities as a seller

While Commas handles the payment infrastructure, you are responsible for: **fulfilling orders** and delivering what you promised, **providing dispute evidence** when chargebacks occur, and **maintaining a healthy account** by keeping refund and dispute rates low. Commas also requires compliance with our Merchant Acceptance Policy below — as the entity of record, we must ensure all sales meet our agreements and applicable regulations.

COUNTRIES

### Payment Acceptance

Commas supports payment acceptance from customers internationally. Depending on your account settings and the buyer's country, customers can pay with major credit and debit cards, wallets (Apple Pay, Google Pay, Link, Amazon Pay), Cash App Pay, PayPal, ACH bank debit, crypto, and buy-now-pay-later options including Klarna, Affirm, Afterpay/Clearpay, Zip and Sezzle. See [Accepted Payment Methods](#accepted-payment-methods) for the full list of method identifiers and how availability is filtered per checkout.

⚠ Sanctioned regions

Payments from customers in sanctioned or restricted jurisdictions (such as those on OFAC sanctions lists) will be automatically declined. Commas handles this automatically — no configuration is required from you.

MERCHANT ACCEPTANCE POLICY

### Merchant Acceptance Policy

Commas supports creators and businesses across a wide range of industries. However, to maintain platform integrity and comply with our payment processor agreements, certain business types and product categories are not permitted.

Please review this list before launching your product. If you're unsure, contact Commas support before going live.

✓ Permitted on Commas

- ✓ Digital content & subscriptions (courses, newsletters, communities)
- ✓ Creator memberships (Discord, Telegram, Slack groups)
- ✓ Software & SaaS products
- ✓ Digital downloads & files
- ✓ Consulting & professional services
- ✓ Online events & experiences
- ✓ Coaching & mentorship programs
- ✓ Paid newsletters & media

✗ Not Permitted on Commas

- ✗ Adult / explicit content
- ✗ Gambling, lottery, or wagering services
- ✗ Cryptocurrency, forex, or investment products
- ✗ Firearms, ammunition, or regulated weapons
- ✗ Prescription medications or controlled substances
- ✗ Multi-level marketing (MLM) or pyramid schemes
- ✗ High-risk financial services
- ✗ Counterfeit or pirated goods

⚠ Policy violations

Violating these policies may result in immediate account suspension and fund holds. If you're unsure whether your product qualifies, please contact **support@fanbasis.com** before launching.

REVIEW AND MONITORING

### Review & Monitoring Policy

As the Merchant of Record, Commas actively monitors all transactions on our platform to detect fraud, unusual activity, and policy violations. This protects both you and your customers — but keeping your account in good standing is a shared effort. Sellers with high dispute rates, excessive refunds, or policy violations may face account restrictions.

◆ Transaction Monitoring

All transactions are screened in real time for fraud signals using offer type, customer IP address, risk score, and other signals. Because Commas is the Merchant of Record, card network monitoring programs like Visa VAMP evaluate Commas at the platform level — not individual sellers — shielding your account from direct network-level scrutiny.

◆ Dispute Auto-Resolution (RDR/Ethoca)

Commas uses RDR and Ethoca to automatically resolve eligible low-value disputes before they escalate into chargebacks. This helps protect your dispute rate. For disputes that do escalate, they appear in your Resolution Center where **you provide the evidence** — Commas then files it with the card networks on your behalf. Responding to disputes promptly and with strong evidence is key to maintaining a healthy account.

◆ Account Reviews

New accounts may undergo a brief review period before payouts are enabled. Accounts suspected of policy violations may be placed on temporary hold pending investigation. We reserve the right to request business documentation — such as business registration or ID verification — for accounts processing above certain thresholds.

APP STORE BYPASS

### Avoiding App Store Fees

Creators who sell digital products or memberships **directly via the web** — rather than through in-app purchases inside an iOS or Android app — pay only Commas's processing fee and keep the rest, instead of giving Apple or Google 15–30% of every sale.

### Where this applies

Commas checkout works for any sale completed outside of a native app storefront. Common use cases:

- → Subscription communities (Discord, Telegram, Slack) — linked from email, your website, or social media
- → Newsletters and online courses sold via a web page or link
- → Digital downloads and software licenses
- → Any offer completed through a Commas checkout link shared outside of a native app

⚠ Native app restrictions

Apple and Google require that purchases made _inside_ a native iOS or Android app go through their in-app purchase systems. You cannot link to or promote external payment options from within a native app. Commas checkout is not suitable as a replacement for in-app purchases within a live App Store or Google Play app. This restriction applies to the app itself — you can freely share Commas checkout links via email, your website, SMS, or social media. Commas is not responsible for ensuring your implementation complies with app store policies — consult Apple's and Google's current developer guidelines and a legal professional before implementation.

● Evolving regulations

Recent legal rulings (including the Epic v. Apple case) have opened new options in certain jurisdictions. The rules are actively changing — consult a legal professional if you need guidance specific to your situation.

═══════════════════════ WEBHOOKS ═══════════════════════
