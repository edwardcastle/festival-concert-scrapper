import { db } from '../../db'
import { contacts } from '../../db/schema'
import { checkDuplicate } from '../../utils/dedup'

function normalizeHandle(handle: string | null | undefined): string | null {
  if (!handle) return null
  return handle.replace(/^@/, '').toLowerCase().trim() || null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const items: any[] = body.contacts || body

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Array of contacts required',
    })
  }

  let inserted = 0
  let skipped = 0
  let duplicates = 0
  const errors: string[] = []

  for (const item of items) {
    if (!item.name) {
      skipped++
      errors.push(`Skipped: missing name`)
      continue
    }

    item.instagram_handle = normalizeHandle(item.instagram_handle)

    const dedup = await checkDuplicate(item)
    if (dedup.status === 'exact_match') {
      duplicates++
      continue
    }

    try {
      db.insert(contacts)
        .values({
          name: item.name,
          type: item.type || null,
          instagram_handle: item.instagram_handle,
          instagram_url: item.instagram_url || null,
          instagram_followers: item.instagram_followers || null,
          email: item.email || null,
          phone: item.phone || null,
          website: item.website || null,
          city: item.city || null,
          country: item.country || null,
          region: item.region || null,
          event_type: item.event_type || null,
          genres: item.genres || null,
          capacity: item.capacity || null,
          dates_2026: item.dates_2026 || null,
          lineup_artists: item.lineup_artists || null,
          cuban_connection: item.cuban_connection || null,
          status: item.status || 'new',
          contacted_date: item.contacted_date || null,
          contacted_via: item.contacted_via || null,
          response_notes: item.response_notes || null,
          admin_notes: item.admin_notes || null,
          priority: item.priority ?? 0,
          tags: item.tags || null,
          source: item.source || null,
          source_query: item.source_query || null,
          raw_data: item.raw_data || null,
        })
        .run()
      inserted++
    } catch (e: any) {
      skipped++
      errors.push(`Error inserting "${item.name}": ${e.message}`)
    }
  }

  return { inserted, skipped, duplicates, total: items.length, errors }
})
