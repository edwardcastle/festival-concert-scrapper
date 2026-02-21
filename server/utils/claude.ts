import type { SerperResult } from './serper'

interface ExtractedEntity {
  name: string
  type?: string
  instagram_handle?: string
  email?: string
  phone?: string
  website?: string
  city?: string
  country?: string
  genres?: string
  cuban_connection?: string
  event_type?: string
}

const SYSTEM_PROMPT = `You are a Latin music industry data extraction assistant. Given search results about Latin music promoters, festivals, venues, and clubs in Europe, extract structured contact information.

For each distinct entity found, extract:
- name: The organization/person name
- type: One of "promoter", "festival", "venue", "club", "media", "agency"
- instagram_handle: Instagram handle without @
- email: Contact email
- phone: Phone number
- website: Website URL
- city: City name
- country: Country name
- genres: Comma-separated music genres (e.g., "reggaeton, salsa, timba")
- cuban_connection: Any mention of Cuban music, artists, or cultural connection (null if none)
- event_type: Type of event (festival, club night, concert series, etc.)

Return a JSON array of extracted entities. Only include entities that are clearly identifiable. If no entities can be extracted, return an empty array.`

export async function extractWithClaude(
  results: SerperResult[],
  apiKey: string
): Promise<ExtractedEntity[] | null> {
  try {
    const content = results
      .map(
        (r) =>
          `Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}`
      )
      .join('\n\n---\n\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Extract Latin music industry contacts from these search results:\n\n${content}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return null
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null

    return JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('Claude extraction failed:', e)
    return null
  }
}
