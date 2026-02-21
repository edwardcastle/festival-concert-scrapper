import { db } from '../../db'
import { contacts } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

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

  db.delete(contacts).where(eq(contacts.id, id)).run()

  return { success: true }
})
