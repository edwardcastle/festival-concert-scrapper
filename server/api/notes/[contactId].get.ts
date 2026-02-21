import { db } from '../../db'
import { notes } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const contactId = Number(getRouterParam(event, 'contactId'))

  if (!contactId || isNaN(contactId)) {
    throw createError({ statusCode: 400, message: 'Invalid contact ID' })
  }

  return await db
    .select()
    .from(notes)
    .where(eq(notes.contact_id, contactId))
    .orderBy(desc(notes.created_at))
    .all()
})
