import type { SerperResult } from './serper'

export interface ExtractedContact {
  name: string
  type?: string
  instagram_handle?: string
  instagram_url?: string
  instagram_followers?: string
  email?: string
  phone?: string
  website?: string
  city?: string
  country?: string
  genres?: string
  cuban_connection?: string
  event_type?: string
  notes?: string
  source_url?: string
}

const COUNTRY_MAP: Record<string, string> = {
  spain: 'Spain', españa: 'Spain', espana: 'Spain',
  italy: 'Italy', italia: 'Italy',
  france: 'France', francia: 'France',
  germany: 'Germany', alemania: 'Germany', deutschland: 'Germany',
  netherlands: 'Netherlands', holanda: 'Netherlands', 'países bajos': 'Netherlands',
  belgium: 'Belgium', bélgica: 'Belgium', belgica: 'Belgium',
  portugal: 'Portugal',
  uk: 'UK', 'united kingdom': 'UK', 'reino unido': 'UK', england: 'UK',
  switzerland: 'Switzerland', suiza: 'Switzerland',
  austria: 'Austria',
  poland: 'Poland', polonia: 'Poland',
  'czech republic': 'Czech Republic',
  sweden: 'Sweden', suecia: 'Sweden',
  denmark: 'Denmark', dinamarca: 'Denmark',
  norway: 'Norway', noruega: 'Norway',
  finland: 'Finland',
  greece: 'Greece', grecia: 'Greece',
  croatia: 'Croatia', croacia: 'Croatia',
  hungary: 'Hungary', hungría: 'Hungary',
  romania: 'Romania',
  cuba: 'Cuba',
  mexico: 'Mexico', méxico: 'Mexico',
  colombia: 'Colombia',
  argentina: 'Argentina',
  chile: 'Chile',
  peru: 'Peru', perú: 'Peru',
  brazil: 'Brazil', brasil: 'Brazil',
  'dominican republic': 'Dominican Republic', 'república dominicana': 'Dominican Republic',
  'puerto rico': 'Puerto Rico',
  panama: 'Panama', panamá: 'Panama',
}

const CITY_TO_COUNTRY: Record<string, [string, string]> = {
  amsterdam: ['Amsterdam', 'Netherlands'],
  barcelona: ['Barcelona', 'Spain'],
  madrid: ['Madrid', 'Spain'],
  berlin: ['Berlin', 'Germany'],
  paris: ['Paris', 'France'],
  roma: ['Rome', 'Italy'], rome: ['Rome', 'Italy'],
  milan: ['Milan', 'Italy'], milano: ['Milan', 'Italy'],
  lisbon: ['Lisbon', 'Portugal'], lisboa: ['Lisbon', 'Portugal'],
  zurich: ['Zurich', 'Switzerland'], zürich: ['Zurich', 'Switzerland'],
  vienna: ['Vienna', 'Austria'],
  brussels: ['Brussels', 'Belgium'], bruselas: ['Brussels', 'Belgium'],
  london: ['London', 'UK'],
  ibiza: ['Ibiza', 'Spain'],
  valencia: ['Valencia', 'Spain'],
  sevilla: ['Seville', 'Spain'], seville: ['Seville', 'Spain'],
  bilbao: ['Bilbao', 'Spain'],
  málaga: ['Malaga', 'Spain'], malaga: ['Malaga', 'Spain'],
  munich: ['Munich', 'Germany'], münchen: ['Munich', 'Germany'],
  hamburg: ['Hamburg', 'Germany'],
  copenhagen: ['Copenhagen', 'Denmark'],
  stockholm: ['Stockholm', 'Sweden'],
  lyon: ['Lyon', 'France'],
  marseille: ['Marseille', 'France'],
  torremolinos: ['Torremolinos', 'Spain'],
  cádiz: ['Cadiz', 'Spain'], cadiz: ['Cadiz', 'Spain'],
}

const TYPE_KEYWORDS: Record<string, string> = {
  festival: 'festival', fest: 'festival',
  club: 'club', nightclub: 'club', discoteca: 'club',
  promoter: 'promoter', promotora: 'promoter', promotor: 'promoter',
  venue: 'venue', sala: 'venue',
  party: 'club', fiesta: 'club',
  agency: 'agency', agencia: 'agency', booking: 'agency',
}

const GENRE_KEYWORDS = [
  'reggaeton', 'latin', 'salsa', 'cubaton', 'dembow', 'bachata',
  'timba', 'merengue', 'cumbia', 'tropical', 'urbano', 'urban latin',
  'perreo', 'dancehall', 'afrobeat', 'rumba', 'son cubano',
  'latin trap', 'regueton', 'reggaetón',
]

const CUBAN_KEYWORDS = [
  'cuba', 'cubano', 'cubana', 'habana', 'havana', 'timba',
  'son cubano', 'cubaton', 'cuban', 'reparto',
]

// Reserved Instagram paths (not user profiles)
const IG_RESERVED_PATHS = new Set([
  'p', 'explore', 'reels', 'stories', 'accounts', 'directory',
  'about', 'legal', 'developer', 'reel', 'tv', 'live',
])

function extractInstagramHandle(url: string): string | null {
  const match = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)\/?/)
  if (match && !IG_RESERVED_PATHS.has(match[1].toLowerCase())) {
    return match[1].toLowerCase()
  }
  return null
}

function detectCountry(text: string): string | undefined {
  const lower = text.toLowerCase()
  // Check cities first (more specific)
  for (const [keyword, [, country]] of Object.entries(CITY_TO_COUNTRY)) {
    if (lower.includes(keyword)) return country
  }
  for (const [keyword, country] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(keyword)) return country
  }
  return undefined
}

function detectCity(text: string): string | undefined {
  const lower = text.toLowerCase()
  for (const [keyword, [city]] of Object.entries(CITY_TO_COUNTRY)) {
    if (lower.includes(keyword)) return city
  }
  return undefined
}

function detectType(text: string): string | undefined {
  const lower = text.toLowerCase()
  for (const [keyword, type] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) return type
  }
  return undefined
}

function detectGenres(text: string): string | undefined {
  const lower = text.toLowerCase()
  const found = GENRE_KEYWORDS.filter(g => lower.includes(g))
  return found.length > 0 ? found.join(', ') : undefined
}

function detectCuban(text: string): string | undefined {
  const lower = text.toLowerCase()
  const found = CUBAN_KEYWORDS.filter(k => lower.includes(k))
  return found.length > 0 ? `Mentions: ${found.join(', ')}` : undefined
}

function cleanEntityName(name: string): string {
  return name
    .replace(/\s*[-|–—]\s*.*(Instagram|Facebook|Twitter|YouTube|TikTok|LinkedIn|Home|Official|Tripadvisor|Time Out|Rumbo|MFW|Guide|photos and videos|Fotos|Videos).*/i, '')
    .replace(/\s*[|]\s*.*$/i, '')
    .replace(/\s*on Instagram$/i, '')
    .replace(/\s*•\s*Instagram.*$/i, '')
    .replace(/\(@[a-zA-Z0-9_.]+\)\s*/g, '')
    .replace(/["']/g, '')
    .replace(/^\d+[.)]\s*/, '')
    .trim()
}

/**
 * Extract contact from an Instagram URL result.
 * When Google returns instagram.com/handle, we can directly extract the handle.
 */
function extractFromInstagramResult(result: SerperResult): ExtractedContact | null {
  const handle = extractInstagramHandle(result.link)
  if (!handle) return null

  let name = cleanEntityName(result.title)
  if (name.length < 2) name = handle

  const fullText = `${result.title} ${result.snippet}`

  // Extract followers from snippet (e.g., "1,234 Followers", "469K Followers")
  const followersMatch = fullText.match(/([\d,.]+[KMB]?)\s*Followers/i)

  // Extract email from snippet
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

  const type = detectType(fullText)

  return {
    name,
    instagram_handle: handle,
    instagram_url: `https://www.instagram.com/${handle}/`,
    instagram_followers: followersMatch ? followersMatch[1] : undefined,
    email: emailMatch ? emailMatch[0] : undefined,
    country: detectCountry(fullText),
    city: detectCity(fullText),
    type: type,
    genres: detectGenres(fullText),
    cuban_connection: detectCuban(fullText),
    event_type: type === 'festival' ? 'festival' : undefined,
    notes: result.snippet.substring(0, 200),
    source_url: result.link,
  }
}

// Detect if this is a list article (e.g., "15 mejores festivales de música")
const LIST_INDICATORS = /\d+\s*(mejores|best|top|principales|festivales|festivals|clubs)/i

// Split numbered lists: "1. Tomorrowland · 2. Sziget · 3. Rock en Seine"
function extractNamesFromList(text: string): string[] {
  const names: string[] = []

  // Pattern: "1. Name · 2. Name" or "1. Name, 2. Name"
  const numberedPattern = /\d+[.)]\s*([^·,\-\d][^·,\-]*?)(?=\s*[·,\-]\s*\d+[.)]\|$)/g
  let match
  while ((match = numberedPattern.exec(text)) !== null) {
    const name = match[1].trim().replace(/\s+\d+$/, '').trim()
    if (name.length > 2 && name.length < 60) {
      names.push(name)
    }
  }

  if (names.length > 0) return names

  // Pattern: "Name · Name · Name" (dot-separated)
  if (text.includes('·')) {
    const parts = text.split('·').map(p => p.trim()).filter(p =>
      p.length > 2 && p.length < 60 && !/^\d+$/.test(p)
    )
    if (parts.length >= 2) return parts
  }

  return names
}

/**
 * Extract contacts from regular (non-Instagram) search results.
 */
function extractFromRegularResult(result: SerperResult): ExtractedContact[] {
  const entities: ExtractedContact[] = []
  const fullText = `${result.title} ${result.snippet}`

  // Extract @handles from the text
  const handleMatches = fullText.match(/@([a-zA-Z0-9_.]{2,30})/g)
  const handles = handleMatches
    ? handleMatches.map(h => h.replace('@', '').toLowerCase())
    : []

  // Extract emails
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  // Extract phones
  const phoneMatch = fullText.match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/)

  const baseCountry = detectCountry(fullText)
  const baseCity = detectCity(fullText)
  const baseType = detectType(fullText)
  const baseGenres = detectGenres(fullText)
  const baseCuban = detectCuban(fullText)

  // Check if this is a list article
  const isList = LIST_INDICATORS.test(fullText)

  if (isList) {
    const names = extractNamesFromList(result.snippet)
    for (const rawName of names) {
      const name = cleanEntityName(rawName)
      if (name.length < 3) continue

      const entityText = rawName.toLowerCase()
      entities.push({
        name,
        type: detectType(entityText) || baseType || 'festival',
        country: detectCountry(entityText) || baseCountry,
        city: detectCity(entityText) || baseCity,
        genres: detectGenres(entityText) || baseGenres,
        cuban_connection: detectCuban(entityText) || baseCuban,
        website: result.link,
        source_url: result.link,
      })
    }
    if (entities.length > 0) return entities
  }

  // Single entity from this result
  const name = cleanEntityName(result.title)

  // Skip generic article titles
  if (/mejores|best|top\s+\d|guide|tripadvisor|timeout|time out|wikipedia|blog|article/i.test(name)) {
    return entities
  }

  if (name.length < 3) return entities

  const igHandle = handles.length > 0 ? handles[0] : undefined

  entities.push({
    name,
    type: baseType,
    instagram_handle: igHandle,
    instagram_url: igHandle ? `https://www.instagram.com/${igHandle}/` : undefined,
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    website: result.link,
    country: baseCountry,
    city: baseCity,
    genres: baseGenres,
    cuban_connection: baseCuban,
    event_type: baseType === 'festival' ? 'festival' : undefined,
    notes: result.snippet.substring(0, 200),
    source_url: result.link,
  })

  return entities
}

/**
 * Main extraction function. Processes all search results and returns
 * a flat, deduplicated list of extracted contacts.
 */
export function extractFromResults(results: SerperResult[]): ExtractedContact[] {
  const entities: ExtractedContact[] = []
  const seenNames = new Set<string>()
  const seenHandles = new Set<string>()

  for (const result of results) {
    // Instagram URL → extract handle directly from URL
    if (result.link.includes('instagram.com')) {
      const contact = extractFromInstagramResult(result)
      if (contact) {
        const key = contact.instagram_handle || contact.name.toLowerCase()
        if (!seenHandles.has(key) && !seenNames.has(contact.name.toLowerCase())) {
          seenHandles.add(key)
          seenNames.add(contact.name.toLowerCase())
          entities.push(contact)
        }
      }
      continue
    }

    // Regular result → extract entities
    const extracted = extractFromRegularResult(result)
    for (const entity of extracted) {
      const lowerName = entity.name.toLowerCase()
      const handleKey = entity.instagram_handle || ''

      if (seenNames.has(lowerName)) continue
      if (handleKey && seenHandles.has(handleKey)) continue

      seenNames.add(lowerName)
      if (handleKey) seenHandles.add(handleKey)
      entities.push(entity)
    }
  }

  return entities
}

/**
 * Merge entities from multiple sources (AI + rule-based).
 * AI entities take priority but rule-based fills gaps.
 */
export function mergeEntityLists(...lists: ExtractedContact[][]): ExtractedContact[] {
  const byHandle = new Map<string, ExtractedContact>()
  const byName = new Map<string, ExtractedContact>()
  const result: ExtractedContact[] = []

  for (const list of lists) {
    for (const entity of list) {
      const handle = entity.instagram_handle?.toLowerCase()
      const lowerName = entity.name.toLowerCase()

      // Check if we already have this entity
      const existing = (handle && byHandle.get(handle)) || byName.get(lowerName)

      if (existing) {
        // Merge: fill in missing fields from new entity
        for (const [key, value] of Object.entries(entity)) {
          if (value && !(existing as any)[key]) {
            (existing as any)[key] = value
          }
        }
      } else {
        // New entity
        if (handle) byHandle.set(handle, entity)
        byName.set(lowerName, entity)
        result.push(entity)
      }
    }
  }

  return result
}
