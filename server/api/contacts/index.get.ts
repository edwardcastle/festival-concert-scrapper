import { db } from '../../db'
import { contacts } from '../../db/schema'
import { sql, eq, like, and, or, desc, asc, inArray } from 'drizzle-orm'
import type { ContactFilters } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as ContactFilters

  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25))
  const offset = (page - 1) * limit
  const sortField = query.sort || 'updated_at'
  const sortOrder = query.order === 'asc' ? asc : desc

  const conditions: any[] = []

  // Text search
  if (query.search) {
    const term = `%${query.search}%`
    conditions.push(
      or(
        like(contacts.name, term),
        like(contacts.email, term),
        like(contacts.instagram_handle, term),
        like(contacts.city, term),
        like(contacts.country, term),
        like(contacts.admin_notes, term)
      )
    )
  }

  // Status filter
  if (query.status) {
    const statuses = Array.isArray(query.status) ? query.status : [query.status]
    if (statuses.length === 1) {
      conditions.push(eq(contacts.status, statuses[0]))
    } else {
      conditions.push(inArray(contacts.status, statuses))
    }
  }

  // Country filter
  if (query.country) {
    const countries = Array.isArray(query.country)
      ? query.country
      : [query.country]
    if (countries.length === 1) {
      conditions.push(eq(contacts.country, countries[0]))
    } else {
      conditions.push(inArray(contacts.country, countries))
    }
  }

  // Type filter
  if (query.type) {
    conditions.push(eq(contacts.type, query.type))
  }

  // Priority filter
  if (query.priority !== undefined && query.priority !== '') {
    conditions.push(eq(contacts.priority, Number(query.priority)))
  }

  // Cuban connection filter
  if (query.cuban_connection === 'true') {
    conditions.push(
      and(
        sql`${contacts.cuban_connection} IS NOT NULL`,
        sql`${contacts.cuban_connection} != ''`
      )
    )
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  // Get sort column reference
  const sortColumn = (contacts as any)[sortField] || contacts.updated_at

  const data = db
    .select()
    .from(contacts)
    .where(where)
    .orderBy(sortOrder(sortColumn))
    .limit(limit)
    .offset(offset)
    .all()

  const totalResult = db
    .select({ count: sql<number>`count(*)` })
    .from(contacts)
    .where(where)
    .get()

  const total = totalResult?.count || 0

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
})
