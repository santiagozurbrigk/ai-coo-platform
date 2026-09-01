> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Pylon

> How Pylon uses Fathom to power AI-native customer support.

[Pylon](https://www.usepylon.com/?utm_source=fathom\&utm_medium=referral\&utm_campaign=integration-comarketing) is the AI-native support platform built for B2B. They help modern businesses handle support tickets efficiently and understand what's going on with their customers.

They built [a Fathom integration](https://docs.usepylon.com/pylon-docs/integrations/call-recording/fathom) to bring meeting insights directly into their customer support and success workflows.

> "With Fathom connected, our customers get enriched account notebooks that combine call data with data from Slack, email, etc. They also get AI-powered tasks auto-created from them and tracked in Pylon based on what was discussed on their call. Finally, their support team can now also harness all the knowledge across their collective Fathom calls to answer customer questions with Pylon's AI copilot."
> — Advith Chelikani, CTO, Pylon

<img src="https://mintcdn.com/fathom-e4df0608/6o825NnlNj3O49Hb/images/pylon.png?fit=max&auto=format&n=6o825NnlNj3O49Hb&q=85&s=6bfded16f360e2efeb3e5e1cf1ce317b" alt="Pylon Screenshot" width="3516" height="2380" data-path="images/pylon.png" />

***

## How it works

1. **Customer connects via OAuth** — Pylon uses Fathom's OAuth to let each customer securely link their account.
2. **Webhook fires** — when a meeting is completed, Fathom sends Pylon the meeting metadata.
3. **Data processed** — Pylon requests transcript and meeting metadata from Fathom.
4. **Data enriched** — Pylon uses Fathom data to enrich customer records and power AI workflows inside the platform.

***

## Example setup

Below is a simplified version of how Pylon wired things up:

### OAuth Token Exchange

```go go theme={null}
func (c *Controller) HandleFathomOAuth(w http.ResponseWriter, req *http.Request) {
    code := req.FormValue("code")

    data := url.Values{}
    data.Set("grant_type", "authorization_code")
    data.Set("code", code)
    data.Add("client_id", c.config.FathomClientID)
    data.Add("client_secret", c.config.FathomClientSecret)
    data.Add("redirect_uri", c.config.CallbackUrl()+"/fathom/oauth-callback")

    tokenReq, _ := http.NewRequest(http.MethodPost,
        "https://api.fathom.ai/external/v1/oauth2/token",
        strings.NewReader(data.Encode()))
    tokenReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")

    resp, _ := c.httpClient.Do(tokenReq)
    var tokenResp FathomTokenResponse
    json.NewDecoder(resp.Body).Decode(&tokenResp)

    // Store encrypted tokens
    org.AppSettings.FathomTokenEncrypted = c.tokenCrypter.EncryptTokenString(tokenResp.AccessToken)
    org.AppSettings.FathomRefreshTokenEncrypted = c.tokenCrypter.EncryptTokenString(tokenResp.RefreshToken)
}
```

### Webhook Setup

```go go theme={null}
// Create webhook for receiving events
func (c *Impl) CreateWebhook(ctx context.Context, input *fathomtypes.CreateWebhookInput) (*fathomtypes.CreateWebhookResponse, error) {
    url := "https://api.fathom.ai/external/v1/webhooks"

    jsonBody, _ := json.Marshal(input)
    req, _ := http.NewRequest(http.MethodPost, url, bytes.NewReader(jsonBody))

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+c.apiKey)

    resp, _ := c.httpClient.Do(req)
    defer resp.Body.Close()

    var webhookResp fathomtypes.CreateWebhookResponse
    json.NewDecoder(resp.Body).Decode(&webhookResp)

    return &webhookResp, nil
}
```

### Fetching Meeting Data

```go theme={null}
// Get meetings with transcripts from Fathom API
func (c *Impl) GetTranscripts(ctx context.Context, input *GetTranscriptsInput) ([]*fathomtypes.Meeting, string, error) {
    baseURL := "https://api.fathom.ai/external/v1/meetings"
    parsedURL, _ := url.Parse(baseURL)

    query := url.Values{}
    if input.IncludeTranscript {
        query.Add("include_transcript", "true")
    }
    if input.Cursor != "" {
        query.Add("cursor", input.Cursor)
    }
    query.Add("limit", strconv.Itoa(input.Limit))
    parsedURL.RawQuery = query.Encode()

    req, _ := http.NewRequest(http.MethodGet, parsedURL.String(), nil)
    req.Header.Add("Authorization", "Bearer "+c.apiKey)

    resp, _ := c.httpClient.Do(req)
    defer resp.Body.Close()

    var response fathomtypes.GetMeetingsResponse
    json.NewDecoder(resp.Body).Decode(&response)

    meetings := make([]*fathomtypes.Meeting, len(response.Items))
    for i, meeting := range response.Items {
        meetings[i] = &meeting
    }

    return meetings, *response.NextCursor, nil
}
```

## Why it matters

With the Pylon + Fathom integration, support and success teams can:

* Build account notebooks that combine calls, Slack, email, and more
* Auto-generate AI-powered tasks directly from customer conversations
* Use tools like Ask AI and Issue Copilot with call recordings as a knowledge source

👉 [Learn more about Pylon](https://www.usepylon.com/?utm_source=fathom\&utm_medium=referral\&utm_campaign=integration-comarketing).
