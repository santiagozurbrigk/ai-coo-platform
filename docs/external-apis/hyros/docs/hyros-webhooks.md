---
title: "Hyros Webhooks"
source: "https://docs.hyros.com/docs/hyros-webhooks"
seccion: "API & Integrations"
capturado: "2026-08-30"
---

# Hyros Webhooks

With Hyros Webhooks we are able to send all tracked data to any system that has the necessary permissions to process this type of data.

Important!

Please keep in mind that creating the webhooks requires development skills. The analyst team is unable to assist you in creating webhooks do not have development skills.

## Webhook Payload Example

When a webhook is triggered, Hyros will send a JSON payload containing the event data. Here's an example of a sale event payload:

json

```
{
  "event": "sale.attributed",
  "data": {
    "sources": [
      {
        "tag": "@sl1",
        "disregarded": false,
        "organic": false,
        "trafficSource": {
          "id": "cat-5b8d6c9793ffa110725a9c9093514668",
          "name": "automatic"
        },
        "goal": {
          "id": "cat-290631a916115729cd9fe08cee0efc84",
          "name": "all"
        },
        "category": {
          "id": "cat-b6faae8ed01c3ca86e0d31b4b1292e40",
          "name": "automatic"
        }
      }
    ],
    "lead": {
      "email": "lead@example.com",
      "joinDate": "2022-09-28T14:55:25-03:00",
      "UTCJoinDate": "2022-09-28T14:55:25-03:00",
      "ips": ["0.0.0.0"],
      "tags": ["!clicked", "@sl1", "$product1"]
    },
    "orderId": "a659f6a6ad024164851b0bfbf363c436",
    "recurring": false,
    "product": {
      "id": "pdt-2499a46c7806509b9c843ad8248bdfd2",
      "quantity": 1,
      "name": "product1",
      "tag": "$product1",
      "category": {
        "id": "cat-ac78d25c92950a16199b5fc86ad86737",
        "name": "No Category"
      },
      "price": {
        "price": 150,
        "discount": 0,
        "hardCost": 0,
        "refunded": 0,
        "currency": "USD"
      },
      "USDPrice": {
        "price": 150,
        "discount": 0,
        "hardCost": 0,
        "refunded": 0,
        "currency": "USD"
      }
    }
  }
}
```

## FAQs

#### Can I stop a webhook once it’s created?

Yes you can, if you want to stop sending events for a while or want to enable them again, you can do so by following these steps:

#### What events can I subscribe to?

You can subscribe to various events including:

- **sale.attributed** - Triggered when a sale is attributed to a source
- **lead.created** - Triggered when a new lead is created
- **call.completed** - Triggered when a call is completed
- **refund.processed** - Triggered when a refund is processed

#### Does the sale.attributed event take into account organic sources?

Yes, it should take into account any source. As long as a sale is attributed to a source, an event will be sent.

#### What sources are sent with the sale.attributed event?

We will include ALL sources clicked prior to the purchase being made in the attribution array, that way you can potentially apply custom attribution modes if you wish.

There are also 2 more fields called `firstSource` and `lastSource` which you can use if you are only interested in the first and last source click.
