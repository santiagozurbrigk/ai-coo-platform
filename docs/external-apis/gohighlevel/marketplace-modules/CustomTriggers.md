---
title: "Creating a Marketplace Workflow Trigger"
source: "https://marketplace.gohighlevel.com/docs/marketplace-modules/CustomTriggers"
seccion: "Marketplace Modules > Workflow Actions and Triggers > Marketplace Workflow Triggers"
api_version: "v3"
capturado: "2026-08-30"
---

# Creating a Marketplace Workflow Trigger

Marketplace Workflow Triggers are the customizable workflow triggers managed in [Marketplace](https://marketplace.gohighlevel.com/). You will be able to create custom triggers to push data from your application/API to a workflow.

[Video Walkthrough on How to create Marketplace Workflow Trigger](https://youtu.be/5Ii6NM4iCI8)

## Create a New Trigger

- Navigate to the Workflow section, located under the Modules in the left-hand navigation menu of your app.
- Click on "Create Trigger" to initiate the process.

## Define Trigger Information

- **Name:** Provide a descriptive name for your trigger.
- **Key:** Assign a unique identifier (e.g., `mycustomtrigger`). This key is immutable and used to reference the trigger within workflows.
- **Icon:** Select an icon to represent the trigger visually in the workflow builder.
- **Short Description:** Write a brief explanation of what the trigger does.
- **Summary:** Provide detailed information about the trigger's functionality and use cases.

## Configure Trigger Data

- Input a sample JSON payload that represents the data structure the trigger will handle. This sample is used to configure filters and custom variables.

## Manage Filters

- Filters allow users to define conditions under which the trigger activates.

**Create New Filter:**

- **Name:** Enter a name for the filter.
- **Type:** Choose from the following field types:
  - String (Simple text matching)
  - Select / Multi-Select
  - Dynamic
- **Required:** Specify if the filter is mandatory.
- **Reference:** Map the filter to a key in the sample trigger data.
- **Alters Dynamic Filter:** If enabled, any changes made to this filter value will trigger/re-trigger loading the dynamic filters in the workflow trigger configuration UI.

**Type: Select / Multi Select**

**Option Type** is applicable only for Select and Multi Select field types.

Select one of the following option types:

- **Constants** Load options by adding custom Label-Value constants
- **Internal Reference** Load options from HighLevel Internal Modules. Select one of the HighLevel Modules to load options list.

**Supported HighLevel Modules**

- **External API** Load option from external API endpoint

**URL (GET)** Provide a URL to support GET method and send a valid response as per the sample response structure shared below.

**Headers** Add headers as per your requirement

**Sample Response Data**

```json
{
"options": [
  { "label": "Afghanistan", "value": "AF" },
  { "label": "Åland Islands", "value": "AX" },
  { "label": "Albania", "value": "AL" },
  { "label": "Algeria", "value": "DZ" },
  { "label": "American Samoa", "value": "AS" }
]
}
```

**Type: Dynamic**

Dynamic filters are used to build custom filters from an API call. The API call should return the below response structure to construct the filters in the Workflow trigger configuration form UI. Only one Dynamic type can be created per trigger.

**URL (POST)** Enter your API endpoint URL. When executed data is sent to this API endpoint via POST method in the below mentioned payload format and a valid response is expected as per the sample response structure shared below.

**Headers** Add headers as per your requirement

**Sample Payload:** The form data is sent as payload to the dynamic field API

```json
{
  "data": {
    "name": "John Doe",
    "age": "29",
    "gender": "male",
    "hobbies": ["sports", "music"],
    "address": "My Address",
    "country": "US",
    "profileType": "public"
  },
  "extras": {
    "locationId": "xyz",
    "contactId": "abc",
    "workflowId": "def"
  },
  "meta": {
    "key": "custom_trigger_key",
    "version": "1.0"
  }
}
```

---

**Sample Response Structure:**

```json
{
  "filters": [
    { "field": "name", "title": "Name", "fieldType": "string", "required": true },
    { "field": "gender", "title": "Gender", "fieldType": "select", "required": true,
      "options": [
        { "label": "Male", "value": "male" },
        { "label": "Female", "value": "female" }
      ]
    }
  ]
}
```

---

**Sample structure for each Filter Type**

**String**

```json
{ "field": "name", "title": "Name", "fieldType": "string", "required": true }
```

**Select**

```json
{
  "field": "gender",
  "title": "Gender",
  "fieldType": "select",
  "required": true,
  "options": [
    { "label": "Male", "value": "male" },
    { "label": "Female", "value": "female" }
  ]
}
```

**Multiple Select**

```json
{
  "field": "hobbies",
  "title": "Hobbies",
  "fieldType": "multiselect",
  "required": true,
  "options": [
    { "label": "Sport", "value": "sport" },
    { "label": "Music", "value": "music" }
  ]
}
```

## Manage Custom Variables

- Custom variables allow users to map data from the trigger payload to variables used within the workflow.

**Add Custom Variable:**

- **Name:** Enter a label for the variable.
- **Reference:** Select a key from the sample trigger data to bind to this variable.

## Set Up Subscription URL

- The Subscription URL is an API endpoint that receives trigger configuration details whenever the trigger is created, updated, or deleted in a workflow.
- **URL (POST):** Enter your API endpoint URL.
- **Headers:** Add any required headers for the API call.
- **Payload Format:** The payload sent to this endpoint will include trigger data, metadata, and additional information such as location ID, workflow ID, and company ID.

#### Trigger "CREATED" in workflow

```json
{
  "triggerData": {
    "id": "def",
    "key": "trigger_a",
    "filters": [],
    "eventType": "CREATED",
    "targetUrl": "https://services.leadconnectorhq.com/workflows-marketplace/triggers/execute/abc/def"
  },
  "meta": { "key": "trigger_a", "version": "2.4" },
  "extras": { "locationId": "ghj", "workflowId": "qwe", "companyId": "asd" }
}
```

#### Trigger "UPDATED" in workflow

```json
{
  "triggerData": {
    "id": "def",
    "key": "trigger_a",
    "filters": [
      {
        "field": "country",
        "id": "country",
        "operator": "==",
        "title": "Country",
        "type": "select",
        "value": "USA"
      }
    ],
    "eventType": "UPDATED",
    "targetUrl": "https://services.leadconnectorhq.com/workflows-marketplace/triggers/execute/abc/def"
  },
  "meta": { "key": "trigger_a", "version": "2.4" },
  "extras": { "locationId": "ghj", "workflowId": "qwe", "companyId": "asd" }
}
```

#### Trigger "DELETED" in workflow

```json
{
  "triggerData": {
    "id": "def",
    "key": "trigger_a",
    "filters": [
      {
        "field": "country",
        "id": "country",
        "operator": "==",
        "title": "Country",
        "type": "select",
        "value": "USA"
      }
    ],
    "eventType": "DELETED",
    "targetUrl": "https://services.leadconnectorhq.com/workflows-marketplace/triggers/execute/abc/def"
  },
  "meta": { "key": "trigger_a", "version": "2.4" },
  "extras": { "locationId": "ghj", "workflowId": "qwe", "companyId": "asd" }
}
```

---

## Submit for Review

Once the trigger is configured:

- Click on "Submit for Review."
- Provide changelog information for the submitted version.
- Upon approval, the trigger becomes available to all sub-accounts.

---

## Version Management

- **Create New Version:** Click on "+ New Version" to create a new draft version of the trigger. This version will prefill all previously published data.
- **Submit for Review:** Each new version must be submitted for review and approved before it becomes live.

---

## Delete Trigger

- To delete a trigger, enter the trigger name to confirm deletion.
- Once deleted, the trigger is permanently removed and cannot be restored.
- Any workflows using the deleted trigger will skip its execution.

---

## Can Workflows Execute Without Contact?

- Workflow can run contactless without any Contact data dependency so you can send any payload data via Marketplace Triggers and use it in workflow.
- You can proceed without contact and use actions that are not dependent on contact information. Custom Webhook, Google Sheet, Slack, ChatGPT and all Internal Tools can be executed without contact.
- If necessary, you can use the Create/Update or Find Contact actions to retrieve the contact data to the workflow.

**Examples:**

- Send order data to trigger and add the order information to google sheet, use if/else to categorize based on order value and send a slack notification.
- Retrieve the contact with Contact ID using Find contact action

---

For more detailed information, refer to the official HighLevel guide on [Marketplace Workflow Triggers.](https://help.gohighlevel.com/support/solutions/articles/155000001024-marketplace-workflow-triggers)

---
