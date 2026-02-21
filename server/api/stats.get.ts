import { db } from '../db'
import { contacts, searchHistory } from '../db/schema'
import { sql, desc, and, gte } from 'drizzle-orm'

export default defineEventHandler(() => {
  // Total contacts
  const totalResult = db
    .select({ count: sql<number>`count(*)` })
    .from(contacts)
    .get()
  const total = totalResult?.count || 0

  // Contacts by status
  const byStatus = db
    .select({
      status: contacts.status,
      count: sql<number>`count(*)`,
    })
    .from(contacts)
    .groupBy(contacts.status)
    .all()

  // Contacts by country (top 15)
  const byCountry = db
    .select({
      country: contacts.country,
      count: sql<number>`count(*)`,
    })
    .from(contacts)
    .where(sql`${contacts.country} IS NOT NULL AND ${contacts.country} != ''`)
    .groupBy(contacts.country)
    .orderBy(desc(sql`count(*)`))
    .limit(15)
    .all()

  // Contacts by type
  const byType = db
    .select({
      type: contacts.type,
      count: sql<number>`count(*)`,
    })
    .from(contacts)
    .where(sql`${contacts.type} IS NOT NULL AND ${contacts.type} != ''`)
    .groupBy(contacts.type)
    .all()

  // Cuban-connected
  const cubanResult = db
    .select({ count: sql<number>`count(*)` })
    .from(contacts)
    .where(
      and(
        sql`${contacts.cuban_connection} IS NOT NULL`,
        sql`${contacts.cuban_connection} != ''`
      )
    )
    .get()
  const cubanCount = cubanResult?.count || 0

  // Contacts added this month
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthStr = thisMonth.toISOString().slice(0, 10)
  const thisMonthResult = db
    .select({ count: sql<number>`count(*)` })
    .from(contacts)
    .where(gte(contacts.created_at, monthStr))
    .get()
  const thisMonthCount = thisMonthResult?.count || 0

  // Contacts added over time (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysStr = thirtyDaysAgo.toISOString().slice(0, 10)

  const overTime = db
    .select({
      date: sql<string>`date(${contacts.created_at})`,
      count: sql<number>`count(*)`,
    })
    .from(contacts)
    .where(gte(contacts.created_at, thirtyDaysStr))
    .groupBy(sql`date(${contacts.created_at})`)
    .orderBy(sql`date(${contacts.created_at})`)
    .all()

  // Recent search history
  const recentSearches = db
    .select()
    .from(searchHistory)
    .orderBy(desc(searchHistory.created_at))
    .limit(10)
    .all()

  // Total searches
  const totalSearchesResult = db
    .select({ count: sql<number>`count(*)` })
    .from(searchHistory)
    .get()
  const totalSearches = totalSearchesResult?.count || 0

  return {
    total,
    cubanCount,
    cubanPercentage: total > 0 ? Math.round((cubanCount / total) * 100) : 0,
    thisMonthCount,
    totalSearches,
    byStatus,
    byCountry,
    byType,
    overTime,
    recentSearches,
  }
})
