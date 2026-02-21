import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/latinconnect.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })

let initialized = false

export async function ensureDb() {
  if (initialized) return
  initialized = true

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      instagram_handle TEXT UNIQUE,
      instagram_url TEXT,
      instagram_followers TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      city TEXT,
      country TEXT,
      region TEXT,
      event_type TEXT,
      genres TEXT,
      capacity TEXT,
      dates_2026 TEXT,
      lineup_artists TEXT,
      cuban_connection TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      contacted_date TEXT,
      contacted_via TEXT,
      response_notes TEXT,
      admin_notes TEXT,
      priority INTEGER NOT NULL DEFAULT 0,
      tags TEXT,
      source TEXT,
      source_query TEXT,
      raw_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'note',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      results_count INTEGER NOT NULL DEFAULT 0,
      new_contacts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}
