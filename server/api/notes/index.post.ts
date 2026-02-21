import { db } from '../../db'
import { notes, contacts } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.contact_id || !body.content) {
    throw createError({
      statusCode: 400,
      message: 'contact_id and content are required',
    })
  }

  // Verify contact exists
  const contact = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, body.contact_id))
    .get()

  if (!contact) {
    throw createError({ statusCode: 404, message: 'Contact not found' })
  }

  const result = await db
    .insert(notes)
    .values({
      contact_id: body.contact_id,
      content: body.content,
      type: body.type || 'note',
    })
    .run()

  return { id: result.lastInsertRowid }
})
