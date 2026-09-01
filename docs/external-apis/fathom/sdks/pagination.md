> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Pagination

> Handle paginated responses with the Fathom SDKs

## Pagination

Both TypeScript and Python SDKs handle pagination automatically. The SDKs return paginated responses that you can iterate through to access all data.

### Basic Pagination

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });

  const result = await fathom.listMeetings({});

  for await (const page of result) {
    console.log(page);
  }
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, models

  with Fathom(
      security=models.Security(
          api_key_auth="YOUR_API_KEY",
      ),
  ) as fathom:
      res = fathom.list_meetings()

      while res is not None:
          print(res)
          res = res.next()
  ```
</CodeGroup>

### Processing All Data

Here's how to collect all data from paginated responses:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  async function getAllMeetings() {
    const fathom = new Fathom({
      security: {
        apiKeyAuth: "YOUR_API_KEY"
      }
    });

    const result = await fathom.listMeetings({});
    const allMeetings: any[] = [];
    
    for await (const page of result) {
      if (page.items) {
        allMeetings.push(...page.items);
      }
    }
    
    console.log(`Total meetings: ${allMeetings.length}`);
    return allMeetings;
  }
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, models

  def get_all_meetings():
      with Fathom(
          security=models.Security(
              api_key_auth="YOUR_API_KEY",
          ),
      ) as fathom:
          res = fathom.list_meetings()
          all_meetings = []
          
          while res is not None:
              all_meetings.extend(res.result.items)
              res = res.next()
          
          print(f"Total meetings: {len(all_meetings)}")
          return all_meetings
  ```
</CodeGroup>

### Pagination Best Practices

1. **Use async iteration (TypeScript)**: The `for await...of` syntax is the recommended way to handle pagination
2. **Use while loops (Python)**: The `while res is not None` pattern is the standard approach
3. **Process incrementally**: For large datasets, consider processing each page as it comes rather than collecting all data in memory
4. **Handle errors**: Wrap pagination in try-catch blocks for robust error handling (see [Error Handling](/sdks/error-handling))
5. **Respect rate limits**: The SDK handles [rate limiting](/api-overview#rate-limiting) automatically, but be mindful of API usage
