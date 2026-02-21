import { db } from '../../db'
import { contacts, notes } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid contact ID' })
  }

  const contact = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .get()

  if (!contact) {
    throw createError({ statusCode: 404, message: 'Contact not found' })
  }

  const contactNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.contact_id, id))
    .orderBy(desc(notes.created_at))
    .all()

  return {
    ...contact,
    notes: contactNotes,
  }
})
