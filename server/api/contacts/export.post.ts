import { db } from '../../db'
import { contacts } from '../../db/schema'
import { sql, eq, like, and, or, desc, asc, inArray } from 'drizzle-orm'
import * as XLSX from 'xlsx'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { format = 'csv', filters = {} } = body

  const conditions: any[] = []

  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(
      or(
        like(contacts.name, term),
        like(contacts.email, term),
        like(contacts.instagram_handle, term),
        like(contacts.city, term),
        like(contacts.country, term)
      )
    )
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status]
    if (statuses.length > 0) {
      conditions.push(inArray(contacts.status, statuses))
    }
  }

  if (filters.country) {
    const countries = Array.isArray(filters.country)
      ? filters.country
      : [filters.country]
    if (countries.length > 0) {
      conditions.push(inArray(contacts.country, countries))
    }
  }

  if (filters.type) {
    conditions.push(eq(contacts.type, filters.type))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const data = db
    .select()
    .from(contacts)
    .where(where)
    .orderBy(desc(contacts.updated_at))
    .all()

  // Build worksheet
  const exportData = data.map((c) => ({
    Name: c.name,
    Type: c.type || '',
    Email: c.email || '',
    Phone: c.phone || '',
    Website: c.website || '',
    Instagram: c.instagram_handle || '',
    'Instagram Followers': c.instagram_followers || '',
    City: c.city || '',
    Country: c.country || '',
    Region: c.region || '',
    'Event Type': c.event_type || '',
    Genres: c.genres || '',
    Capacity: c.capacity || '',
    'Dates 2026': c.dates_2026 || '',
    'Cuban Connection': c.cuban_connection || '',
    Status: c.status,
    Priority: c.priority,
    Tags: c.tags || '',
    Source: c.source || '',
    'Admin Notes': c.admin_notes || '',
    'Created At': c.created_at,
    'Updated At': c.updated_at,
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Contacts')

  if (format === 'xlsx') {
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="contacts.xlsx"')
    return buffer
  }

  // CSV
  const csv = XLSX.utils.sheet_to_csv(ws)
  setResponseHeader(event, 'Content-Type', 'text/csv')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="contacts.csv"')
  return csv
})
