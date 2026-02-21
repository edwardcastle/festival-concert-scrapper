import type { SerperResult } from './serper'
import type { ExtractedContact } from './rule-extractor'

const SYSTEM_PROMPT = `You are a Latin music industry data extraction expert with deep knowledge of European and Latin American promoters, festivals, venues, and clubs.

Given Google search results, identify EVERY distinct Latin music entity mentioned (promoters, festivals, venues, clubs, agencies, party brands).

For each entity, provide complete contact data. IMPORTANT: Use your knowledge to fill in Instagram handles, websites, and other details for well-known entities — even if they don't appear in the search snippets.

Return a JSON array where each item has:
{
  "name": "Full entity name (e.g. Reggaeton Beach Festival)",
  "type": "promoter | festival | venue | club | media | agency",
  "instagram_handle": "handle_without_at (e.g. reggaetonbeachfestival)",
  "instagram_url": "https://www.instagram.com/handle/",
  "email": "email@example.com or null",
  "website": "https://example.com or null",
  "city": "City name",
  "country": "Country name",
  "event_type": "festival | club night | concert series | touring party",
  "genres": "reggaeton, latin, salsa, etc.",
  "instagram_followers": "approximate like 469K or null",
  "notes": "Brief description (1-2 sentences about what they do)",
  "cuban_connection": "Any Cuban music connection (artists booked, Cuban music focus) or null"
}

RULES:
- Extract EVERY distinct entity mentioned, including from listicle articles ("10 best festivals...")
- For well-known entities, provide their REAL Instagram handles from your knowledge
- Only provide data you are confident is accurate — do NOT fabricate handles
- If a snippet shows @handle, always extract it
- Include the entity's city and country when identifiable
- Genres should be comma-separated
- Notes should describe what the entity is/does
- Return ONLY the JSON array, no other text`

export async function extractWithClaude(
  results: SerperResult[],
  apiKey: string
): Promise<ExtractedContact[] | null> {
  try {
    const content = results
      .map(
        (r, i) =>
          `[${i + 1}] Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}`
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
            content: `Extract all Latin music industry contacts from these ${results.length} Google search results. Provide complete data for each entity, including Instagram handles for well-known ones:\n\n${content}`,
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

    const parsed = JSON.parse(jsonMatch[0])

    // Normalize the parsed data
    return parsed.map((entity: any) => ({
      name: entity.name || '',
      type: entity.type || undefined,
      instagram_handle: entity.instagram_handle
        ? entity.instagram_handle.replace(/^@/, '').toLowerCase()
        : undefined,
      instagram_url: entity.instagram_url || (entity.instagram_handle
        ? `https://www.instagram.com/${entity.instagram_handle.replace(/^@/, '').toLowerCase()}/`
        : undefined),
      instagram_followers: entity.instagram_followers || undefined,
      email: entity.email || undefined,
      phone: entity.phone || undefined,
      website: entity.website || undefined,
      city: entity.city || undefined,
      country: entity.country || undefined,
      genres: entity.genres || undefined,
      cuban_connection: entity.cuban_connection || undefined,
      event_type: entity.event_type || undefined,
      notes: entity.notes || undefined,
    })).filter((e: any) => e.name && e.name.length > 1)
  } catch (e) {
    console.error('Claude extraction failed:', e)
    return null
  }
}
