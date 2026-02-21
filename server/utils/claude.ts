import type { SerperResult } from './serper'
import type { ExtractedContact } from './rule-extractor'

const SYSTEM_PROMPT = `You are building a CRM database of Latin music industry contacts across Europe. Your job is to extract EVERY promoter, festival, venue, club, agency, and party brand from Google search results.

You have EXPERT knowledge of the European Latin/reggaeton/urban music scene. Use your training data to provide COMPLETE contact information — especially Instagram handles — even when they don't appear in the search snippets.

For EACH entity, return a JSON object with these fields:
{
  "name": "Official name (e.g., 'Reggaeton Beach Festival', 'Pachamama Paris', 'I Love Reggaeton')",
  "type": "promoter | festival | venue | club | media | agency",
  "instagram_handle": "handle WITHOUT @ symbol (e.g., 'reggaetonbeachfestival'). USE YOUR KNOWLEDGE for well-known entities.",
  "instagram_url": "https://www.instagram.com/handle/",
  "email": "booking/contact email if found in snippets, or null",
  "phone": "phone/WhatsApp number if found, or null",
  "website": "official website URL, or null",
  "city": "primary city (e.g., 'Barcelona', 'Paris')",
  "country": "country name (e.g., 'Spain', 'France')",
  "event_type": "festival | club night | concert series | touring party | venue",
  "genres": "comma-separated (e.g., 'reggaeton, latin, urbano, perreo, dembow')",
  "instagram_followers": "approximate count from your knowledge (e.g., '469K', '1M') or null",
  "notes": "Informative 1-2 sentence description: what they do, event sizes, notable lineups, 2025/2026 dates if known",
  "cuban_connection": "Specific Cuban music connections (e.g., 'Books Osmani García, Jacob Forever', 'Timba/cubaton focus') or null"
}

CRITICAL RULES:
1. Extract EVERY distinct entity. If an article says "10 best Latin festivals in Spain" — extract ALL 10 individual festivals.
2. For well-known brands (I Love Reggaeton, Reggaeton Beach Festival, Puro Latino, Gasolina Party, Pachamama, etc.) ALWAYS provide their real Instagram handle from your knowledge.
3. NEVER fabricate an Instagram handle you're not confident about. Omit it rather than guess.
4. Always extract @handles and emails that appear literally in snippets.
5. "notes" should be useful: approximate event size, years active, multi-city if applicable, upcoming dates.
6. For "cuban_connection": mention specific Cuban/reparto/timba artists they book, or Cuban music genres they feature. null if none.
7. Return ONLY a valid JSON array. No markdown code fences, no explanation text — just the raw JSON array.
8. Aim to return 10-30 distinct contacts per search. Be thorough.`

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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `I'm searching for: "${results.length > 0 ? extractQueryContext(results) : 'Latin music contacts'}"\n\nHere are ${results.length} Google search results. Extract EVERY Latin music promoter, festival, venue, club, or agency mentioned. Use your knowledge to provide Instagram handles for well-known entities:\n\n${content}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error('Claude API error:', response.status, errText)
      return null
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Extract JSON array from response (handles markdown fences too)
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('Claude response had no JSON array:', text.substring(0, 200))
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed)) return null

    // Normalize and validate each entity
    return parsed
      .map((entity: any) => {
        const handle = entity.instagram_handle
          ? entity.instagram_handle.replace(/^@/, '').replace(/\/$/, '').toLowerCase().trim()
          : undefined

        return {
          name: (entity.name || '').trim(),
          type: entity.type || undefined,
          instagram_handle: handle || undefined,
          instagram_url: handle
            ? `https://www.instagram.com/${handle}/`
            : undefined,
          instagram_followers: entity.instagram_followers || undefined,
          email: entity.email && entity.email !== 'null' ? entity.email : undefined,
          phone: entity.phone && entity.phone !== 'null' ? entity.phone : undefined,
          website: entity.website && entity.website !== 'null' ? entity.website : undefined,
          city: entity.city || undefined,
          country: entity.country || undefined,
          genres: entity.genres || undefined,
          cuban_connection: entity.cuban_connection && entity.cuban_connection !== 'null'
            ? entity.cuban_connection
            : undefined,
          event_type: entity.event_type || undefined,
          notes: entity.notes || undefined,
        }
      })
      .filter((e: ExtractedContact) => e.name && e.name.length > 1)
  } catch (e) {
    console.error('Claude extraction failed:', e)
    return null
  }
}

/**
 * Try to infer the search context from the results to give Claude better context.
 */
function extractQueryContext(results: SerperResult[]): string {
  // Use the first few titles to give Claude context about what was searched
  return results
    .slice(0, 3)
    .map((r) => r.title)
    .join(' | ')
}
