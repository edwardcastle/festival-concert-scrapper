export interface SerperResult {
  title: string
  link: string
  snippet: string
  position: number
}

export async function searchGoogle(
  query: string,
  apiKey: string,
  num: number = 20
): Promise<SerperResult[]> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num }),
  })

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`)
  }

  const data = await response.json()

  return (data.organic || []).map((r: any) => ({
    title: r.title || '',
    link: r.link || '',
    snippet: r.snippet || '',
    position: r.position || 0,
  }))
}

/**
 * Run multiple targeted searches and merge results.
 * - Original query for general results
 * - Instagram-targeted query to find actual IG profiles
 */
export async function multiSearch(
  query: string,
  apiKey: string
): Promise<SerperResult[]> {
  const [mainResults, igResults] = await Promise.all([
    searchGoogle(query, apiKey, 20),
    searchGoogle(`${query} instagram`, apiKey, 10),
  ])

  // Merge and deduplicate by URL
  const seen = new Set<string>()
  const merged: SerperResult[] = []

  for (const results of [mainResults, igResults]) {
    for (const r of results) {
      if (!seen.has(r.link)) {
        seen.add(r.link)
        merged.push(r)
      }
    }
  }

  return merged
}
