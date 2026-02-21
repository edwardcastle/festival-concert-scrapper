import { db } from '../../db'
import { contacts } from '../../db/schema'
import { sql } from 'drizzle-orm'
import { statSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const aiAvailable = !!config.anthropicApiKey
  const serperAvailable = !!config.serperApiKey

  let dbSize = '0 KB'
  try {
    const stats = statSync(join(process.cwd(), 'data', 'latinconnect.db'))
    const kb = stats.size / 1024
    dbSize = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
  } catch {}

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(contacts)
    .get()

  return {
    aiAvailable,
    serperAvailable,
    dbSize,
    contactCount: countResult?.count || 0,
  }
})
