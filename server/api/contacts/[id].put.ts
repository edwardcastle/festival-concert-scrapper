import { db } from '../../db'
import { contacts } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'

function normalizeHandle(handle: string | null | undefined): string | null {
  if (!handle) return null
  return handle.replace(/^@/, '').toLowerCase().trim() || null
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid contact ID' })
  }

  const existing = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Contact not found' })
  }

  if (body.instagram_handle !== undefined) {
    body.instagram_handle = normalizeHandle(body.instagram_handle)
  }

  db.update(contacts)
    .set({
      ...body,
      updated_at: sql`datetime('now')`,
    })
    .where(eq(contacts.id, id))
    .run()

  return db.select().from(contacts).where(eq(contacts.id, id)).get()
})
