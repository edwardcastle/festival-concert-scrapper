import { db } from '../../db'
import { notes } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid note ID' })
  }

  const existing = db.select().from(notes).where(eq(notes.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Note not found' })
  }

  db.delete(notes).where(eq(notes.id, id)).run()

  return { success: true }
})
