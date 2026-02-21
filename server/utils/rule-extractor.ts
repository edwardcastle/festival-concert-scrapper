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

const COUNTRY_MAP: Record<string, string> = {
  spain: 'Spain', españa: 'Spain', espana: 'Spain',
  italy: 'Italy', italia: 'Italy',
  france: 'France', francia: 'France',
  germany: 'Germany', alemania: 'Germany', deutschland: 'Germany',
  netherlands: 'Netherlands', holanda: 'Netherlands', 'países bajos': 'Netherlands',
  belgium: 'Belgium', bélgica: 'Belgium', belgica: 'Belgium',
  portugal: 'Portugal',
  uk: 'UK', 'united kingdom': 'UK', 'reino unido': 'UK', england: 'UK', london: 'UK',
  switzerland: 'Switzerland', suiza: 'Switzerland',
  austria: 'Austria',
  poland: 'Poland', polonia: 'Poland',
  'czech republic': 'Czech Republic',
  sweden: 'Sweden', suecia: 'Sweden',
  denmark: 'Denmark',
  norway: 'Norway',
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
  amsterdam: 'Netherlands', barcelona: 'Spain', madrid: 'Spain',
  berlin: 'Germany', paris: 'France', roma: 'Italy', rome: 'Italy',
  milan: 'Italy', milano: 'Italy', lisbon: 'Portugal', lisboa: 'Portugal',
  zurich: 'Switzerland', zürich: 'Switzerland', vienna: 'Austria',
  brussels: 'Belgium', bruselas: 'Belgium',
}

const CITY_MAP: Record<string, string> = {
  amsterdam: 'Amsterdam', barcelona: 'Barcelona', madrid: 'Madrid',
  berlin: 'Berlin', paris: 'Paris', roma: 'Rome', rome: 'Rome',
  milan: 'Milan', milano: 'Milan', lisbon: 'Lisbon', lisboa: 'Lisbon',
  zurich: 'Zurich', zürich: 'Zurich', vienna: 'Vienna',
  brussels: 'Brussels', bruselas: 'Brussels', london: 'London',
  ibiza: 'Ibiza', valencia: 'Valencia', sevilla: 'Seville',
  bilbao: 'Bilbao', málaga: 'Malaga', malaga: 'Malaga',
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
  'son cubano', 'cubaton', 'cuban',
]

// Words that indicate the result is a list article, not a single entity
const LIST_INDICATORS = /\d+\s*(mejores|best|top|principales|festivales|festivals|clubs)/i

// Split numbered lists: "1. Tomorrowland · 2. Sziget · 3. Rock en Seine"
function extractNamesFromList(text: string): string[] {
  const names: string[] = []

  // Pattern: "1. Name · 2. Name" or "1. Name, 2. Name" or "1. Name - 2. Name"
  const numberedPattern = /\d+[\.\)]\s*([^·,\-\d][^·,\-]*?)(?=\s*[\·,\-]\s*\d+[\.\)]|$)/g
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

function detectCountry(text: string): string | undefined {
  const lower = text.toLowerCase()
  for (const [keyword, country] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(keyword)) return country
  }
  return undefined
}

function detectCity(text: string): string | undefined {
  const lower = text.toLowerCase()
  for (const [keyword, city] of Object.entries(CITY_MAP)) {
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
    .replace(/\s*[-|–—]\s*.*(Instagram|Facebook|Twitter|YouTube|TikTok|LinkedIn|Home|Official|Tripadvisor|Time Out|Rumbo|MFW|Guide).*/i, '')
    .replace(/\s*[|]\s*.*$/i, '')
    .replace(/["']/g, '')
    .replace(/^\d+[\.\)]\s*/, '')
    .trim()
}

export function extractFromResults(
  results: SerperResult[]
): ExtractedEntity[] {
  const entities: ExtractedEntity[] = []
  const seenNames = new Set<string>()

  for (const result of results) {
    const fullText = `${result.title} ${result.snippet}`
    const text = fullText.toLowerCase()

    // Extract emails and handles from snippet
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    const igMatches = fullText.match(/@([a-zA-Z0-9_.]{2,30})/g)
    const phoneMatch = fullText.match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/)

    const baseCountry = detectCountry(text)
    const baseCity = detectCity(text)
    const baseType = detectType(text)
    const baseGenres = detectGenres(text)
    const baseCuban = detectCuban(text)

    // Check if this is a list article (e.g., "15 mejores festivales")
    const isList = LIST_INDICATORS.test(fullText)

    if (isList) {
      // Extract individual names from the snippet
      const names = extractNamesFromList(result.snippet)

      if (names.length > 0) {
        for (const rawName of names) {
          const name = cleanEntityName(rawName)
          const lowerName = name.toLowerCase()

          if (name.length < 3 || seenNames.has(lowerName)) continue
          seenNames.add(lowerName)

          // Try to detect per-entity info
          const entityText = rawName.toLowerCase()
          entities.push({
            name,
            type: detectType(entityText) || baseType || 'festival',
            country: detectCountry(entityText) || baseCountry,
            city: detectCity(entityText) || baseCity,
            genres: detectGenres(entityText) || baseGenres,
            cuban_connection: detectCuban(entityText) || baseCuban,
            website: result.link,
          })
        }
        continue
      }
    }

    // Single entity from this result
    const name = cleanEntityName(result.title)
    const lowerName = name.toLowerCase()

    if (name.length < 3 || seenNames.has(lowerName)) continue

    // Skip generic article titles
    if (/mejores|best|top\s+\d|guide|tripadvisor|timeout|time out|wikipedia/i.test(name)) {
      continue
    }

    seenNames.add(lowerName)

    entities.push({
      name,
      type: baseType,
      instagram_handle: igMatches ? igMatches[0].replace('@', '').toLowerCase() : undefined,
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      website: result.link,
      country: baseCountry,
      city: baseCity,
      genres: baseGenres,
      cuban_connection: baseCuban,
      event_type: baseType === 'festival' ? 'festival' : undefined,
    })
  }

  return entities
}
