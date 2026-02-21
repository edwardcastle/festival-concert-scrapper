import { multiSearch } from '../../utils/serper'
import { extractWithClaude } from '../../utils/claude'
import { extractFromResults, mergeEntityLists } from '../../utils/rule-extractor'
import type { ExtractedContact } from '../../utils/rule-extractor'
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

  // 1. Multi-search via Serper (original + instagram keyword + site:instagram.com)
  const serperResults = await multiSearch(query, config.serperApiKey as string)

  if (serperResults.length === 0) {
    return { contacts: [], mode: 'none', searchCount: 0 }
  }

  // 2. Rule-based extraction (handles IG URLs + basic snippet parsing)
  const ruleEntities = extractFromResults(serperResults)

  // 3. Claude AI extraction — primary source when available
  let entities: ExtractedContact[]
  let mode: 'ai' | 'rule-based' = 'rule-based'

  if (config.anthropicApiKey) {
    const aiEntities = await extractWithClaude(
      serperResults,
      config.anthropicApiKey as string
    )
    if (aiEntities && aiEntities.length > 0) {
      // AI entities are primary, rule-based fills in anything AI missed
      // (especially IG handles extracted directly from instagram.com URLs)
      entities = mergeEntityLists(aiEntities, ruleEntities)
      mode = 'ai'
    } else {
      entities = ruleEntities
    }
  } else {
    entities = ruleEntities
  }

  // 4. Dedup against DB
  const contactsWithDedup = await Promise.all(
    entities.map(async (entity) => {
      const dedup = await checkDuplicate(entity)
      return {
        ...entity,
        dedup: {
          status: dedup.status,
          existingId: dedup.existingContact?.id || null,
          matchField: dedup.matchField || null,
        },
      }
    })
  )

  // 5. Log to search history
  const newCount = contactsWithDedup.filter(
    (c) => c.dedup.status === 'new'
  ).length

  await db
    .insert(searchHistory)
    .values({
      query,
      results_count: contactsWithDedup.length,
      new_contacts: newCount,
    })
    .run()

  return {
    contacts: contactsWithDedup,
    mode,
    searchCount: serperResults.length,
  }
})
