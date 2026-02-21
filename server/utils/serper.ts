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
    body: JSON.stringify({
      q: query,
      num,
    }),
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
