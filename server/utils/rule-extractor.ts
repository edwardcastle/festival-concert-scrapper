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

const EUROPEAN_COUNTRIES = [
  'spain', 'italy', 'france', 'germany', 'netherlands', 'belgium',
  'portugal', 'uk', 'united kingdom', 'switzerland', 'austria',
  'poland', 'czech republic', 'sweden', 'denmark', 'norway',
  'finland', 'greece', 'croatia', 'hungary', 'romania', 'ireland',
  'bulgaria', 'serbia', 'slovenia',
]

const LATAM_COUNTRIES = [
  'cuba', 'mexico', 'colombia', 'argentina', 'chile', 'peru',
  'brazil', 'dominican republic', 'puerto rico', 'panama',
  'venezuela', 'ecuador', 'uruguay', 'costa rica',
]

const ALL_COUNTRIES = [...EUROPEAN_COUNTRIES, ...LATAM_COUNTRIES]

const COUNTRY_MAP: Record<string, string> = {
  spain: 'Spain', italy: 'Italy', france: 'France', germany: 'Germany',
  netherlands: 'Netherlands', belgium: 'Belgium', portugal: 'Portugal',
  uk: 'UK', 'united kingdom': 'UK', switzerland: 'Switzerland',
  austria: 'Austria', poland: 'Poland', 'czech republic': 'Czech Republic',
  sweden: 'Sweden', denmark: 'Denmark', norway: 'Norway', finland: 'Finland',
  greece: 'Greece', croatia: 'Croatia', hungary: 'Hungary', romania: 'Romania',
  ireland: 'Ireland', bulgaria: 'Bulgaria', serbia: 'Serbia', slovenia: 'Slovenia',
  cuba: 'Cuba', mexico: 'Mexico', colombia: 'Colombia', argentina: 'Argentina',
  chile: 'Chile', peru: 'Peru', brazil: 'Brazil',
  'dominican republic': 'Dominican Republic', 'puerto rico': 'Puerto Rico',
  panama: 'Panama', venezuela: 'Venezuela', ecuador: 'Ecuador',
  uruguay: 'Uruguay', 'costa rica': 'Costa Rica',
}

const TYPE_KEYWORDS: Record<string, string> = {
  festival: 'festival',
  fest: 'festival',
  club: 'club',
  nightclub: 'club',
  discoteca: 'club',
  promoter: 'promoter',
  promotora: 'promoter',
  promotor: 'promoter',
  venue: 'venue',
  sala: 'venue',
  party: 'club',
  fiesta: 'club',
  event: 'promoter',
  agency: 'agency',
  agencia: 'agency',
  booking: 'agency',
  media: 'media',
  magazine: 'media',
  radio: 'media',
}

const GENRE_KEYWORDS = [
  'reggaeton', 'latin', 'salsa', 'cubaton', 'dembow', 'bachata',
  'timba', 'merengue', 'cumbia', 'tropical', 'urbano', 'urban latin',
  'perreo', 'dancehall', 'afrobeat', 'afro', 'rumba', 'son cubano',
  'latin trap', 'regueton',
]

const CUBAN_KEYWORDS = [
  'cuba', 'cubano', 'cubana', 'habana', 'havana', 'timba',
  'son cubano', 'cubaton', 'cuban', 'guantanamera',
]

export function extractFromResults(
  results: SerperResult[]
): ExtractedEntity[] {
  const entities: ExtractedEntity[] = []

  for (const result of results) {
    const text = `${result.title} ${result.snippet}`.toLowerCase()
    const fullText = `${result.title} ${result.snippet}`

    // Extract Instagram handles
    const igMatches = fullText.match(/@([a-zA-Z0-9_.]{2,30})/g)
    const instagramHandle = igMatches
      ? igMatches[0].replace('@', '').toLowerCase()
      : undefined

    // Extract emails
    const emailMatch = fullText.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    )
    const email = emailMatch ? emailMatch[0] : undefined

    // Extract phone numbers
    const phoneMatch = fullText.match(
      /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/
    )
    const phone = phoneMatch ? phoneMatch[0] : undefined

    // Detect country
    let country: string | undefined
    for (const c of ALL_COUNTRIES) {
      if (text.includes(c)) {
        country = COUNTRY_MAP[c]
        break
      }
    }

    // Detect type
    let type: string | undefined
    for (const [keyword, typeVal] of Object.entries(TYPE_KEYWORDS)) {
      if (text.includes(keyword)) {
        type = typeVal
        break
      }
    }

    // Detect genres
    const detectedGenres = GENRE_KEYWORDS.filter((g) => text.includes(g))
    const genres =
      detectedGenres.length > 0 ? detectedGenres.join(', ') : undefined

    // Detect Cuban connection
    const cubanMatches = CUBAN_KEYWORDS.filter((k) => text.includes(k))
    const cubanConnection =
      cubanMatches.length > 0
        ? `Mentions: ${cubanMatches.join(', ')}`
        : undefined

    // Build entity name from title (clean up common suffixes)
    const name = result.title
      .replace(/\s*[-|–—]\s*.*(Instagram|Facebook|Twitter|YouTube|TikTok|LinkedIn).*/i, '')
      .replace(/\s*[-|–—]\s*Home$/i, '')
      .replace(/\s*[-|–—]\s*Official.*$/i, '')
      .trim()

    if (name) {
      entities.push({
        name,
        type,
        instagram_handle: instagramHandle,
        email,
        phone,
        website: result.link,
        country,
        genres,
        cuban_connection: cubanConnection,
        event_type: type === 'festival' ? 'festival' : undefined,
      })
    }
  }

  return entities
}
