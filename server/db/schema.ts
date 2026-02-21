import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const contacts = sqliteTable('contacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type'),
  instagram_handle: text('instagram_handle').unique(),
  instagram_url: text('instagram_url'),
  instagram_followers: text('instagram_followers'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  city: text('city'),
  country: text('country'),
  region: text('region'),
  event_type: text('event_type'),
  genres: text('genres'),
  capacity: text('capacity'),
  dates_2026: text('dates_2026'),
  lineup_artists: text('lineup_artists'),
  cuban_connection: text('cuban_connection'),
  status: text('status').notNull().default('new'),
  contacted_date: text('contacted_date'),
  contacted_via: text('contacted_via'),
  response_notes: text('response_notes'),
  admin_notes: text('admin_notes'),
  priority: integer('priority').notNull().default(0),
  tags: text('tags'),
  source: text('source'),
  source_query: text('source_query'),
  raw_data: text('raw_data'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contact_id: integer('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: text('type').notNull().default('note'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const searchHistory = sqliteTable('search_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  query: text('query').notNull(),
  results_count: integer('results_count').notNull().default(0),
  new_contacts: integer('new_contacts').notNull().default(0),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
})
