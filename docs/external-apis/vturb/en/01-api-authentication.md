---
title: "API Authentication"
source: "https://vturb.gitbook.io/analytics-api/api-authentication"
idioma: "en"
capturado: "2026-08-30"
---

# API Authentication

Our API uses two required headers for authentication and versioning. Both headers must be included in every request to ensure proper authentication and API version handling.

### Required Headers

| Header          | Description                                           | Required |
| --------------- | ----------------------------------------------------- | -------- |
| `X-Api-Token`   | Your unique API token for authentication              | Yes      |
| `X-Api-Version` | The API version you want to use (currently only `v1`) | Yes      |

### Getting Your API Token

1. Access your application dashboard
2. Navigate to the API settings section
3. Copy your unique API token
4. Keep this token secure and don't share it publicly

### Making Authenticated Requests

#### Example Request

```bash
curl -X POST 'https://analytics.vturb.net/conversions/active_platforms' \
  -H 'X-Api-Token: YOUR_API_TOKEN' \
  -H 'X-Api-Version: v1' \
  -H 'Content-Type: application/json' \
  -d '{
    "start_date": "2023-10-26 18:24:05",
    "timezone": "America/Sao_Paulo"
  }'
```

#### Using Different Programming Languages

**Python**

```python
import requests

url = "https://analytics.vturb.net/conversions/active_platforms"
headers = {
    "X-Api-Token": "YOUR_API_TOKEN",
    "X-Api-Version": "v1",
    "Content-Type": "application/json"
}
payload = {
    "start_date": "2023-10-26 18:24:05",
    "timezone": "America/Sao_Paulo"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

**JavaScript**

```javascript
const url = 'https://analytics.vturb.net/conversions/active_platforms';
const headers = {
  'X-Api-Token': 'YOUR_API_TOKEN',
  'X-Api-Version': 'v1',
  'Content-Type': 'application/json'
};
const payload = {
  start_date: '2023-10-26 18:24:05',
  timezone: 'America/Sao_Paulo'
};

fetch(url, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(payload)
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Ruby**

```ruby
require 'net/http'
require 'json'
require 'uri'

uri = URI('https://analytics.vturb.net/conversions/active_platforms')
headers = {
  'X-Api-Token' => 'YOUR_API_TOKEN',
  'X-Api-Version' => 'v1',
  'Content-Type' => 'application/json'
}
payload = {
  start_date: '2023-10-26 18:24:05',
  timezone: 'America/Sao_Paulo'
}

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
request = Net::HTTP::Post.new(uri.path, headers)
request.body = payload.to_json

response = http.request(request)
puts JSON.parse(response.body)
```

### Common Authentication Errors

#### 401 Unauthorized

This error occurs when:

* The `X-Api-Token` header is missing or invalid
* The `X-Api-Version` header is missing or invalid

Example error response:

```json
{
  "error": "Unauthorized",
  "message": "Missing proper X-Api-Token or X-Api-Version"
}
```

#### Best Practices

1. **Keep Your Token Secure**
   * Never share your API token publicly
   * Don't commit your token to version control
   * Use environment variables to store your token
   * Rotate your token if it's been compromised
2. **Version Management**
   * Always specify the API version using `X-Api-Version`
   * Currently supported versions:
     * `v1`: Current stable version
3. **Error Handling**
   * Implement proper error handling for authentication failures
   * Include retry logic with appropriate backoff for network issues
   * Log authentication errors for debugging purposes

### Rate Limiting

To protect our API from abuse, we implement rate limiting. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response. Please contact our support team if you need increased rate limits for your application.

### Support

If you're experiencing authentication issues or need help with API integration, please contact our support team at <https://help.vturb.com/en-us/>.
