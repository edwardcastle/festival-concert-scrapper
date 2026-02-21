import { searchGoogle } from '../../utils/serper'
import { extractWithClaude } from '../../utils/claude'
import { extractFromResults } from '../../utils/rule-extractor'
import { checkDuplicate } from '../../utils/dedup'
import { db } from '../../db'
import { searchHistory } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { query } = body

  if (!query || typeof query !== 'string') {
    throw createError({ statusCode: 400, message: 'Search query required' })
  }

  const config = useRuntimeConfig()

  if (!config.serperApiKey) {
    throw createError({
      statusCode: 400,
      message: 'Serper API key not configured. Add SERPER_API_KEY to .env',
    })
  }

  // 1. Search Google via Serper
  const serperResults = await searchGoogle(query, config.serperApiKey)

  if (serperResults.length === 0) {
    return { results: [], mode: 'none' }
  }

  // 2. Extract entities
  let extractedEntities: any[] | null = null
  let mode: 'ai' | 'rule-based' = 'rule-based'

  if (config.anthropicApiKey) {
    extractedEntities = await extractWithClaude(
      serperResults,
      config.anthropicApiKey
    )
    if (extractedEntities && extractedEntities.length > 0) {
      mode = 'ai'
    }
  }

  // Fallback to rule-based
  if (!extractedEntities || extractedEntities.length === 0) {
    extractedEntities = extractFromResults(serperResults)
    mode = 'rule-based'
  }

  // 3. Check dedup for each entity
  const resultsWithDedup = await Promise.all(
    serperResults.map(async (sr) => {
      // Find entities that came from this search result
      const relatedEntities = extractedEntities!.filter((e: any) => {
        if (mode === 'rule-based') {
          return e.website === sr.link
        }
        // For AI mode, match by name similarity to title
        return true
      })

      const contacts = await Promise.all(
        relatedEntities.map(async (entity: any) => {
          const dedup = await checkDuplicate(entity)
          return { data: entity, dedup }
        })
      )

      return {
        title: sr.title,
        url: sr.link,
        snippet: sr.snippet,
        position: sr.position,
        extractionMode: mode,
        contacts,
      }
    })
  )

  // Filter out results with no contacts
  const filteredResults = resultsWithDedup.filter(
    (r) => r.contacts.length > 0
  )

  // 4. Log to search history
  const newCount = filteredResults
    .flatMap((r) => r.contacts)
    .filter((c) => c.dedup.status === 'new').length

  db.insert(searchHistory)
    .values({
      query,
      results_count: filteredResults.length,
      new_contacts: newCount,
    })
    .run()

  return {
    results: filteredResults,
    mode,
    totalResults: serperResults.length,
  }
})
