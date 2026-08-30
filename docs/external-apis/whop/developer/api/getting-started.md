---
title: "Getting started"
source: "https://docs.whop.com/developer/api/getting-started"
capturado: "2026-08-30"
---

# Getting started

> Start programmatically accepting payments, paying other people, and building businesses.

# Use cases

1. Create a checkout configuration
2. Onboard sub-merchants
3. Verify your platform account
4. Programmatically pay out users
5. Generate payout onboarding links for your sub-merchants

<CodeGroup>
  ```bash Typescript theme={null}
  pnpm install @whop/sdk
  ```

  ```bash Python theme={null}
  pip install whop-sdk
  ```

  ```bash Ruby theme={null}
  gem install whop_sdk
  ```

  ```bash Rust theme={null}
  cargo add whop_sdk
  ```

  ```bash Go theme={null}
  go get github.com/whopio/whopsdk-go
  ```
</CodeGroup>

Before you begin, follow the [Quickstart](/developer/api/quickstart#create-an-api-key) to create an API key.

<Card title="Troubleshoot API requests" icon="bug" href="/developer/troubleshooting#api-authentication">
  Debug authentication failures, permission errors, retryable responses, and sandbox/production mismatches.
</Card>

<CodeGroup>
  ```python Python theme={null}
  from whop_sdk import Whop, BadRequestError
  import random

  client = Whop(
      token="YOUR_API_KEY",
  )

  your_account_id = "YOUR_ACCOUNT_ID"

  # 1. Create a checkout configuration
  checkout = client.checkout_configurations.create(
      currency="usd",
      plan={
          "initial_price": 10.0,
          "plan_type": "one_time",
          "account_id": your_account_id,
          "currency": "usd",
          "payment_method_configuration": {
              "enabled": [
                  "crypto", # low fees
                  "us_bank_transfer", # very low fees
                  "apple_pay", # standard cc rates
              ],
              "disabled": [
                  "acss_debit",
                  "affirm",
                  "afterpay_clearpay",
                  "alipay",
                  "alma",
                  "amazon_pay",
              ],
          },
      },
      metadata={
          "order_id": "order_12345",
      },
  )

  checkout_link = f"https://whop.com/checkout/{checkout.plan.id}"
  print(f"\n✅ Checkout created → {checkout_link}\n   (redirect customers here to pay or embed it)")
  input("\nPress Enter to continue...")

  # 2. Onboard sub-merchants to pay them out
  sub_merchant = client.companies.create(
      email="merchant@example.com",
      parent_company_id=your_account_id,
      title="Acme Merchant Store #" + str(random.randint(1, 200)),
      # logo={"id": "file_xxxxxxxxxxxxx"},
      metadata={
          "internal_user_id": "user_12345",
          "seller_tier": "gold",
      },
  )
  print(f"\n✅ Sub-merchant onboarded → {sub_merchant.id}")

  # 2.5 Verify your platform account (skip if already done)
  # Your account must be verified to send transfers.
  print(f"\n🔐 Verify your platform account:\n   https://whop.com/verify-identity/{your_account_id}/")
  input("\nPress Enter when done...")

  # 3. Programmatically pay out users
  while True:
      try:
          transfer = client.transfers.create(
              amount=1.0,
              currency="usd",
              origin_id=your_account_id,
              destination_id=sub_merchant.id,
              metadata={"reason": "creator_payout"},
          )
          if transfer.object == "transfer":
              print(f"\n✅ Transfer complete → {transfer.id}")
          break
      except BadRequestError as e:
          print(f"\n❌ Transfer failed: {e.body['error']['message']}")
          input("\nFix the issue above, then press Enter to retry...")


  # 4. Generate a payout onboarding link for your sub-merchant
  # Short-lived URL — send to the sub-merchant to complete identity verification and payout setup.
  account_link = client.account_links.create(
      company_id=sub_merchant.id,
      refresh_url="https://yourapp.com/onboarding/refresh",
      return_url="https://yourapp.com/onboarding/complete",
      use_case="account_onboarding",
  )
  print(f"\n✅ Send to sub-merchant for payout setup:\n   {account_link.url}")
  ```

  ```typescript Typescript theme={null}
  import { Whop, WhopClient } from "@whop/sdk";
  import * as readline from "node:readline/promises";

  const client = new WhopClient({
    token: "YOUR_API_KEY",
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const yourAccountId = "YOUR_ACCOUNT_ID";

  // 1. Create a checkout configuration
  const checkout = await client.checkoutConfigurations.create({
    currency: "usd",
    plan: {
      initial_price: 10.0,
      plan_type: "one_time",
      account_id: yourAccountId,
      currency: "usd",
      payment_method_configuration: {
        enabled: [
          "crypto", // low fees
          "us_bank_transfer", // very low fees
          "apple_pay", // standard cc rates
        ],
        disabled: [
          "acss_debit",
          "affirm",
          "afterpay_clearpay",
          "alipay",
          "alma",
          "amazon_pay",
        ],
      },
    },
    metadata: {
      order_id: "order_12345",
    },
  });

  const checkoutLink = `https://whop.com/checkout/${checkout.plan?.id}`;
  console.log(`\n✅ Checkout created → ${checkoutLink}\n   (redirect customers here to pay or embed it)`);
  await rl.question("\nPress Enter to continue...");

  // 2. Onboard sub-merchants to pay them out
  const subMerchant = await client.companies.create({
    email: "merchant@example.com",
    parent_company_id: yourAccountId,
    title: `Acme Merchant Store #${Math.floor(Math.random() * 200) + 1}`,
    // logo: new File([...], "logo.png"),
    metadata: {
      internal_user_id: "user_12345",
      seller_tier: "gold",
    },
  });
  console.log(`\n✅ Sub-merchant onboarded → ${subMerchant.id}`);

  // 2.5 Verify your platform account (skip if already done)
  // Your account must be verified to send transfers.
  console.log(`\n🔐 Verify your platform account:\n   https://whop.com/verify-identity/${yourAccountId}/`);
  await rl.question("\nPress Enter when done...");

  // 3. Programmatically pay out users
  while (true) {
    try {
      const transfer = await client.transfers.create({
        amount: 1.0,
        currency: "usd",
        origin_id: yourAccountId,
        destination_id: subMerchant.id,
        metadata: { reason: "creator_payout" },
      });
      if (transfer.object === "transfer") {
        console.log(`\n✅ Transfer complete → ${transfer.id}`);
      }
      break;
    } catch (err) {
      if (err instanceof Whop.BadRequestError) {
        console.log(`\n❌ Transfer failed: ${err.message}`);
        await rl.question("\nFix the issue above, then press Enter to retry...");
        continue;
      }
      throw err;
    }
  }

  // 4. Generate a payout onboarding link for your sub-merchant
  // Short-lived URL — send to the sub-merchant to complete identity verification and payout setup.
  const accountLink = await client.accountLinks.create({
    company_id: subMerchant.id,
    refresh_url: "https://yourapp.com/onboarding/refresh",
    return_url: "https://yourapp.com/onboarding/complete",
    use_case: "account_onboarding",
  });
  console.log(`\n✅ Send to sub-merchant for payout setup:\n   ${accountLink.url}`);

  rl.close();
  ```

  ```ruby Ruby theme={null}
  require "whop_sdk"

  client = Whop_sdk::Client.new(
    token: "YOUR_API_KEY",
  )

  your_account_id = "YOUR_ACCOUNT_ID"

  # 1. Create a checkout configuration
  checkout = client.checkout_configurations.create(
    currency: "usd",
    plan: {
      initial_price: 10.0,
      plan_type: "one_time",
      account_id: your_account_id,
      currency: "usd",
      payment_method_configuration: {
        enabled: [
          "crypto", # low fees
          "us_bank_transfer", # very low fees
          "apple_pay", # standard cc rates
        ],
        disabled: [
          "acss_debit",
          "affirm",
          "afterpay_clearpay",
          "alipay",
          "alma",
          "amazon_pay",
        ],
      },
    },
    metadata: {
      order_id: "order_12345",
    },
  )

  checkout_link = "https://whop.com/checkout/#{checkout.plan.id}"
  puts "\n✅ Checkout created → #{checkout_link}\n   (redirect customers here to pay or embed it)"
  print "\nPress Enter to continue..."
  gets

  # 2. Onboard sub-merchants to pay them out
  sub_merchant = client.companies.create(
    email: "merchant@example.com",
    parent_company_id: your_account_id,
    title: "Acme Merchant Store ##{rand(1..200)}",
    metadata: {
      internal_user_id: "user_12345",
      seller_tier: "gold",
    },
  )
  puts "\n✅ Sub-merchant onboarded → #{sub_merchant.id}"

  # 2.5 Verify your platform account (skip if already done)
  # Your account must be verified to send transfers.
  puts "\n🔐 Verify your platform account:\n   https://whop.com/verify-identity/#{your_account_id}/"
  print "\nPress Enter when done..."
  gets

  # 3. Programmatically pay out users
  loop do
    begin
      transfer = client.transfers.create(
        amount: 1.0,
        currency: "usd",
        origin_id: your_account_id,
        destination_id: sub_merchant.id,
        metadata: { reason: "creator_payout" },
      )
      puts "\n✅ Transfer complete → #{transfer.id}"
      break
    # The Ruby gem has no 400-specific error class, so catch every 4xx.
    rescue Whop_sdk::Errors::ClientError => e
      puts "\n❌ Transfer failed: #{e.message}"
      print "\nFix the issue above, then press Enter to retry..."
      gets
    end
  end

  # 4. Generate a payout onboarding link for your sub-merchant
  # Short-lived URL — send to the sub-merchant to complete identity verification and payout setup.
  account_link = client.account_links.create(
    company_id: sub_merchant.id,
    refresh_url: "https://yourapp.com/onboarding/refresh",
    return_url: "https://yourapp.com/onboarding/complete",
    use_case: "account_onboarding",
  )
  puts "\n✅ Send to sub-merchant for payout setup:\n   #{account_link.url}"
  ```

  ```rust Rust theme={null}
  use whop_sdk::prelude::*;
  use std::io::stdin;

  let config = ClientConfig {
      token: Some("YOUR_API_KEY".to_string()),
      ..Default::default()
  };
  let client = Whop::new(config).expect("Failed to build client");

  let your_account_id = "YOUR_ACCOUNT_ID";

  let pause = || {
      let mut line = String::new();
      stdin().read_line(&mut line).ok();
  };

  // 1. Create a checkout configuration
  let checkout = client
      .checkout_configurations
      .create(
          &CreateCheckoutConfigurationsRequest {
              currency: Some("usd".to_string()),
              plan: Some(CreateCheckoutConfigurationsRequestPlan {
                  initial_price: Some(10.0),
                  plan_type: Some(CreateCheckoutConfigurationsRequestPlanPlanType::OneTime),
                  account_id: Some(your_account_id.to_string()),
                  currency: Some("usd".to_string()),
                  payment_method_configuration: Some(
                      CreateCheckoutConfigurationsRequestPlanPaymentMethodConfiguration {
                          enabled: Some(vec![
                              "crypto".to_string(),            // low fees
                              "us_bank_transfer".to_string(),  // very low fees
                              "apple_pay".to_string(),         // standard cc rates
                          ]),
                          disabled: Some(vec![
                              "acss_debit".to_string(),
                              "affirm".to_string(),
                              "afterpay_clearpay".to_string(),
                              "alipay".to_string(),
                              "alma".to_string(),
                              "amazon_pay".to_string(),
                          ]),
                          ..Default::default()
                      },
                  ),
                  ..Default::default()
              }),
              metadata: Some(HashMap::from([("order_id".to_string(), json!("order_12345"))])),
              ..Default::default()
          },
          None,
      )
      .await?;

  let checkout_link = format!("https://whop.com/checkout/{}", checkout.plan.unwrap().id);
  println!("\n✅ Checkout created → {checkout_link}\n   (redirect customers here to pay or embed it)");
  pause();

  // 2. Onboard sub-merchants to pay them out
  let sub_merchant = client
      .companies
      .create(
          &CreateCompaniesRequest {
              email: Some("merchant@example.com".to_string()),
              parent_company_id: Some(your_account_id.to_string()),
              title: "Acme Merchant Store".to_string(),
              metadata: Some(HashMap::from([
                  ("internal_user_id".to_string(), json!("user_12345")),
                  ("seller_tier".to_string(), json!("gold")),
              ])),
              ..Default::default()
          },
          None,
      )
      .await?;
  println!("\n✅ Sub-merchant onboarded → {}", sub_merchant.id);

  // 2.5 Verify your platform account (skip if already done).
  // Your account must be verified to send transfers.
  println!("\n🔐 Verify your platform account:\n   https://whop.com/verify-identity/{your_account_id}/");
  pause();

  // 3. Programmatically pay out users
  loop {
      match client
          .transfers
          .create(
              &CreateTransfersRequest {
                  amount: 1.0,
                  currency: Some("usd".to_string()),
                  origin_id: your_account_id.to_string(),
                  destination_id: Some(sub_merchant.id.clone()),
                  metadata: Some(HashMap::from([("reason".to_string(), json!("creator_payout"))])),
                  ..Default::default()
              },
              None,
          )
          .await
      {
          Ok(CreateTransfersResponse::Transfer { id, .. }) => {
              println!("\n✅ Transfer complete → {id}");
              break;
          }
          Ok(_) => break,
          Err(ApiError::Http { status: 400, message }) => {
              println!("\n❌ Transfer failed: {message}");
              println!("\nFix the issue above, then press Enter to retry...");
              pause();
          }
          Err(err) => return Err(err),
      }
  }

  // 4. Generate a payout onboarding link for your sub-merchant.
  // Short-lived URL — send it to the sub-merchant to finish identity verification and payout setup.
  let account_link = client
      .account_links
      .create(
          &CreateAccountLinksRequest {
              company_id: sub_merchant.id.clone(),
              refresh_url: "https://yourapp.com/onboarding/refresh".to_string(),
              return_url: "https://yourapp.com/onboarding/complete".to_string(),
              use_case: AccountLinkUseCases::AccountOnboarding,
          },
          None,
      )
      .await?;
  println!("\n✅ Send to sub-merchant for payout setup:\n   {}", account_link.url);
  ```

  ```go Go theme={null}
  import (
      "context"
      "errors"
      "fmt"
      "log"

      whopsdk "github.com/whopio/whopsdk-go"
      "github.com/whopio/whopsdk-go/client"
      "github.com/whopio/whopsdk-go/core"
      "github.com/whopio/whopsdk-go/option"
  )

  client := client.NewWhop(option.WithToken("YOUR_API_KEY"))
  ctx := context.TODO()

  yourAccountID := "YOUR_ACCOUNT_ID"

  // 1. Create a checkout configuration
  checkout, err := client.CheckoutConfigurations.Create(ctx, &whopsdk.CreateCheckoutConfigurationsRequest{
      Currency: whopsdk.String("usd"),
      Plan: &whopsdk.CreateCheckoutConfigurationsRequestPlan{
          InitialPrice: whopsdk.Float64(10.0),
          PlanType:     whopsdk.CreateCheckoutConfigurationsRequestPlanPlanTypeOneTime.Ptr(),
          AccountID:    whopsdk.String(yourAccountID),
          Currency:     whopsdk.String("usd"),
          PaymentMethodConfiguration: &whopsdk.CreateCheckoutConfigurationsRequestPlanPaymentMethodConfiguration{
              Enabled:  []string{"crypto", "us_bank_transfer", "apple_pay"},
              Disabled: []string{"acss_debit", "affirm", "afterpay_clearpay", "alipay", "alma", "amazon_pay"},
          },
      },
      Metadata: map[string]any{"order_id": "order_12345"},
  })
  if err != nil {
      log.Fatal(err)
  }

  fmt.Printf("\n✅ Checkout created → https://whop.com/checkout/%s\n   (redirect customers here to pay or embed it)\n", checkout.Plan.ID)
  fmt.Println("\nPress Enter to continue...")
  fmt.Scanln()

  // 2. Onboard sub-merchants to pay them out
  subMerchant, err := client.Companies.Create(ctx, &whopsdk.CreateCompaniesRequest{
      Email:           whopsdk.String("merchant@example.com"),
      ParentCompanyID: whopsdk.String(yourAccountID),
      Title:           "Acme Merchant Store",
      Metadata: map[string]any{
          "internal_user_id": "user_12345",
          "seller_tier":      "gold",
      },
  })
  if err != nil {
      log.Fatal(err)
  }
  fmt.Printf("\n✅ Sub-merchant onboarded → %s\n", subMerchant.ID)

  // 2.5 Verify your platform account (skip if already done).
  // Your account must be verified to send transfers.
  fmt.Printf("\n🔐 Verify your platform account:\n   https://whop.com/verify-identity/%s/\n", yourAccountID)
  fmt.Println("\nPress Enter when done...")
  fmt.Scanln()

  // 3. Programmatically pay out users
  for {
      resp, err := client.Transfers.Create(ctx, &whopsdk.CreateTransfersRequest{
          Amount:        1.0,
          Currency:      whopsdk.String("usd"),
          OriginID:      yourAccountID,
          DestinationID: whopsdk.String(subMerchant.ID),
          Metadata:      map[string]any{"reason": "creator_payout"},
      })
      if err != nil {
          var apiErr *core.APIError
          if errors.As(err, &apiErr) && apiErr.StatusCode == 400 {
              fmt.Printf("\n❌ Transfer failed: %s\n", apiErr.Error())
              fmt.Println("\nFix the issue above, then press Enter to retry...")
              fmt.Scanln()
              continue
          }
          log.Fatal(err)
      }
      if resp.Object == "transfer" {
          fmt.Printf("\n✅ Transfer complete → %s\n", resp.Transfer.ID)
      }
      break
  }

  // 4. Generate a payout onboarding link for your sub-merchant.
  // Short-lived URL — send it to the sub-merchant to finish identity verification and payout setup.
  accountLink, err := client.AccountLinks.Create(ctx, &whopsdk.CreateAccountLinksRequest{
      CompanyID:  subMerchant.ID,
      RefreshURL: "https://yourapp.com/onboarding/refresh",
      ReturnURL:  "https://yourapp.com/onboarding/complete",
      UseCase:    whopsdk.AccountLinkUseCasesAccountOnboarding,
  })
  if err != nil {
      log.Fatal(err)
  }
  fmt.Printf("\n✅ Send to sub-merchant for payout setup:\n   %s\n", accountLink.URL)
  ```
</CodeGroup>

# API keys

<AccordionGroup>
  <Accordion title="Account API keys" icon="building">
    Use Account API keys when you only want to fetch data or perform actions for your own Account
    and [connected accounts](/supported-business-models/platforms).

    1. Follow the [Quickstart API key steps](/developer/api/quickstart#create-an-api-key) and open **Account API Keys**.
    2. Select **Create** in the **Account API Keys** section.
    3. Give your API key a name, such as `Data pipeline` or `GHL Integration`.
    4. Select a role or a custom set of permissions. You can update the key and add permissions later.
    5. Create the API key, and copy it from the modal.
  </Accordion>

  <Accordion title="App API keys" icon="code">
    Use app API keys when you are building an app and need to access data on accounts that have installed your app.

    1. Open your [dashboard](https://whop.com/dashboard) and choose the business that owns the app.
    2. Open **Developer** → **Apps**.
    3. Select **Create app** and give the app a name, or select an existing app.
    4. On **App details**, find **Get started** → **Set up your local environment**.
    5. Use the copy button in **Copy these environment variables** to copy the real `WHOP_API_KEY`, then store it securely. You will need it to make API calls on behalf of the app.

    <Note>
      This `WHOP_API_KEY` is the app's API credential. It's different from the runtime secrets managed by [`whop apps secrets`](/developer/cli#manage-app-secrets), which are arbitrary key-value environment bindings for your hosted code.
    </Note>
  </Accordion>

  <Accordion title="OAuth tokens" icon="user">
    Use OAuth tokens when you want users to sign in with their Whop account and grant your app permission to act on their behalf. Unlike API keys which use your app's permissions, OAuth tokens are scoped to what each individual user can access.

    Common use cases:

    * "Sign in with Whop" authentication
    * Accessing a user's memberships, purchases, or profile
    * Performing actions as a specific user (not as your app)

    OAuth tokens are obtained through the OAuth 2.1 + PKCE flow:

    1. Redirect users to Whop's authorization page
    2. User logs in and approves your requested scopes
    3. Exchange the authorization code for access and refresh tokens
    4. Use the access token as your API key in SDK calls or the `Authorization` header

    See the [OAuth guide](/developer/guides/oauth) for full implementation details.
  </Accordion>
</AccordionGroup>

# Making API calls

The public API is available at `https://api.whop.com/api/v1`.

Use curl to test the API by fetching your public user profile data:

```bash theme={null}
# replace "j" with your own whop username
curl https://api.whop.com/api/v1/users/j
```

To make authenticated requests you need to include your API key in the `Authorization` header using the `Bearer` scheme:

```bash theme={null}
# replace "YOUR_API_KEY" with your real API key
curl https://api.whop.com/api/v1/payments?company_id=biz_xxxxxxxxxxx \
    -H "Authorization: Bearer YOUR_API_KEY"
```

# SDK reference

* [TypeScript / JavaScript](https://npmjs.com/package/@whop/sdk) / [Docs](https://github.com/whopio/whopsdk-typescript)
* [Python](https://pypi.org/project/whop-sdk) / [Docs](https://github.com/whopio/whopsdk-python)
* [Ruby](https://rubygems.org/gems/whop_sdk) / [Docs](https://github.com/whopio/whopsdk-ruby)
* [Rust](https://crates.io/crates/whop_sdk) / [Docs](https://github.com/whopio/whopsdk-rust)
* [Go](https://pkg.go.dev/github.com/whopio/whopsdk-go) / [Docs](https://github.com/whopio/whopsdk-go)

## MCP

You can also access the API through the Whop Model Context Protocol server at
`https://mcp.whop.com/mcp` (Cursor) or `https://mcp.whop.com/sse` (Claude).

[Learn more here](/developer/guides/ai_and_mcp)
