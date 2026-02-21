import { db } from '../../db'
import { contacts } from '../../db/schema'
import { checkDuplicate } from '../../utils/dedup'

function normalizeHandle(handle: string | null | undefined): string | null {
  if (!handle) return null
  return handle.replace(/^@/, '').toLowerCase().trim() || null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const items: any[] = Array.isArray(body) ? body : [body]

  let inserted = 0
  let skipped = 0

  for (const item of items) {
    if (!item.name) {
      skipped++
      continue
    }

    item.instagram_handle = normalizeHandle(item.instagram_handle)

    const dedup = await checkDuplicate(item)
    if (dedup.status === 'exact_match') {
      skipped++
      continue
    }

    try {
      db.insert(contacts)
        .values({
          name: item.name,
          type: item.type || null,
          instagram_handle: item.instagram_handle || null,
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
          cuban_connection: item.cuban_connection || null,
          status: 'new',
          priority: 0,
          source: item.source || 'search',
          source_query: item.source_query || null,
        })
        .run()
      inserted++
    } catch {
      skipped++
    }
  }

  return { inserted, skipped }
})
