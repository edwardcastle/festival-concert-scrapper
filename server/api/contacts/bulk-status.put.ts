import { db } from '../../db'
import { contacts } from '../../db/schema'
import { eq, inArray, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids, status } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, message: 'Array of IDs required' })
  }

  if (!status) {
    throw createError({ statusCode: 400, message: 'Status is required' })
  }

  db.update(contacts)
    .set({
      status,
      updated_at: sql`datetime('now')`,
    })
    .where(inArray(contacts.id, ids))
    .run()

  return { success: true, updated: ids.length }
})
