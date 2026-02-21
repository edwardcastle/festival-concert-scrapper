import { db } from '../db'
import { contacts } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import type { Contact, DedupCheck, DedupResult } from '~/types'

function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, '').toLowerCase().trim()
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

export async function checkDuplicate(
  data: Partial<Contact>
): Promise<DedupCheck> {
  // Tier 1: Exact instagram_handle match
  if (data.instagram_handle) {
    const normalized = normalizeHandle(data.instagram_handle)
    const existing = db
      .select()
      .from(contacts)
      .where(eq(contacts.instagram_handle, normalized))
      .get()

    if (existing) {
      return {
        status: 'exact_match',
        existingContact: existing as Contact,
        matchField: 'instagram_handle',
      }
    }
  }

  // Tier 2: Fuzzy name match
  if (data.name) {
    const trimmedName = data.name.trim().toLowerCase()
    const allContacts = db
      .select({ id: contacts.id, name: contacts.name })
      .from(contacts)
      .all()

    for (const c of allContacts) {
      const existingName = c.name.trim().toLowerCase()
      if (existingName === trimmedName) {
        const full = db
          .select()
          .from(contacts)
          .where(eq(contacts.id, c.id))
          .get()
        return {
          status: 'possible_duplicate',
          existingContact: full as Contact,
          matchField: 'name (exact)',
        }
      }
      if (levenshtein(existingName, trimmedName) <= 3) {
        const full = db
          .select()
          .from(contacts)
          .where(eq(contacts.id, c.id))
          .get()
        return {
          status: 'possible_duplicate',
          existingContact: full as Contact,
          matchField: 'name (fuzzy)',
        }
      }
    }
  }

  return { status: 'new' }
}

export async function checkDuplicateBatch(
  items: Partial<Contact>[]
): Promise<DedupCheck[]> {
  const results: DedupCheck[] = []
  for (const item of items) {
    results.push(await checkDuplicate(item))
  }
  return results
}
