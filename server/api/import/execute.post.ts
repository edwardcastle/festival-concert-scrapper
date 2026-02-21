import { db } from '../../db'
import { contacts } from '../../db/schema'
import { checkDuplicate } from '../../utils/dedup'

function normalizeHandle(handle: string | null | undefined): string | null {
  if (!handle) return null
  return handle.replace(/^@/, '').toLowerCase().trim() || null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { rows, mapping } = body

  if (!Array.isArray(rows) || rows.length === 0) {
    throw createError({ statusCode: 400, message: 'No data to import' })
  }

  if (!mapping || typeof mapping !== 'object') {
    throw createError({ statusCode: 400, message: 'Column mapping required' })
  }

  let inserted = 0
  let skipped = 0
  let duplicates = 0

  for (const row of rows) {
    // Apply mapping
    const mapped: Record<string, any> = {}
    for (const [sourceCol, targetField] of Object.entries(mapping)) {
      if (targetField && row[sourceCol] !== undefined && row[sourceCol] !== '') {
        mapped[targetField as string] = String(row[sourceCol])
      }
    }

    if (!mapped.name) {
      skipped++
      continue
    }

    mapped.instagram_handle = normalizeHandle(mapped.instagram_handle)

    const dedup = await checkDuplicate(mapped as any)
    if (dedup.status === 'exact_match') {
      duplicates++
      continue
    }

    try {
      db.insert(contacts)
        .values({
          name: mapped.name,
          type: mapped.type || null,
          instagram_handle: mapped.instagram_handle || null,
          instagram_url: mapped.instagram_url || null,
          instagram_followers: mapped.instagram_followers || null,
          email: mapped.email || null,
          phone: mapped.phone || null,
          website: mapped.website || null,
          city: mapped.city || null,
          country: mapped.country || null,
          region: mapped.region || null,
          event_type: mapped.event_type || null,
          genres: mapped.genres || null,
          capacity: mapped.capacity || null,
          dates_2026: mapped.dates_2026 || null,
          lineup_artists: mapped.lineup_artists || null,
          cuban_connection: mapped.cuban_connection || null,
          status: mapped.status || 'new',
          priority: Number(mapped.priority) || 0,
          tags: mapped.tags || null,
          source: mapped.source || 'import',
          admin_notes: mapped.admin_notes || null,
        })
        .run()
      inserted++
    } catch {
      skipped++
    }
  }

  return { inserted, skipped, duplicates, total: rows.length }
})
