import { db } from '../../db'
import { contacts } from '../../db/schema'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const aiAvailable = !!config.anthropicApiKey
  const serperAvailable = !!config.serperApiKey
  const isTurso = !!process.env.TURSO_DATABASE_URL

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(contacts)
    .get()

  return {
    aiAvailable,
    serperAvailable,
    dbSize: isTurso ? 'Cloud (Turso)' : 'Local SQLite',
    contactCount: countResult?.count || 0,
  }
})
