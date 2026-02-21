import { db } from '../../db'
import { contacts } from '../../db/schema'
import { inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, message: 'Array of IDs required' })
  }

  const numericIds = ids.map(Number).filter((id) => !isNaN(id))

  if (numericIds.length === 0) {
    throw createError({ statusCode: 400, message: 'No valid IDs provided' })
  }

  await db.delete(contacts).where(inArray(contacts.id, numericIds)).run()

  return { success: true, deleted: numericIds.length }
})
