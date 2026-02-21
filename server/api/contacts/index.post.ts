import { db } from '../../db'
import { contacts } from '../../db/schema'
import { checkDuplicate } from '../../utils/dedup'

function normalizeHandle(handle: string | null | undefined): string | null {
  if (!handle) return null
  return handle.replace(/^@/, '').toLowerCase().trim() || null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name) {
    throw createError({ statusCode: 400, message: 'Name is required' })
  }

  // Normalize instagram handle
  body.instagram_handle = normalizeHandle(body.instagram_handle)

  // Check for duplicates
  const dedup = await checkDuplicate(body)
  if (dedup.status === 'exact_match') {
    throw createError({
      statusCode: 409,
      message: `Duplicate: exact match on ${dedup.matchField}`,
      data: { dedup },
    })
  }

  const result = db.insert(contacts).values({
    name: body.name,
    type: body.type || null,
    instagram_handle: body.instagram_handle,
    instagram_url: body.instagram_url || null,
    instagram_followers: body.instagram_followers || null,
    email: body.email || null,
    phone: body.phone || null,
    website: body.website || null,
    city: body.city || null,
    country: body.country || null,
    region: body.region || null,
    event_type: body.event_type || null,
    genres: body.genres || null,
    capacity: body.capacity || null,
    dates_2026: body.dates_2026 || null,
    lineup_artists: body.lineup_artists || null,
    cuban_connection: body.cuban_connection || null,
    status: body.status || 'new',
    contacted_date: body.contacted_date || null,
    contacted_via: body.contacted_via || null,
    response_notes: body.response_notes || null,
    admin_notes: body.admin_notes || null,
    priority: body.priority ?? 0,
    tags: body.tags || null,
    source: body.source || null,
    source_query: body.source_query || null,
    raw_data: body.raw_data || null,
  }).run()

  return {
    id: result.lastInsertRowid,
    dedup,
  }
})
