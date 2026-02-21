import { db } from '../../db'
import { searchHistory } from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return await db
    .select()
    .from(searchHistory)
    .orderBy(desc(searchHistory.created_at))
    .limit(50)
    .all()
})
