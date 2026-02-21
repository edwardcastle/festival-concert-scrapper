import { db } from '../../db'
import { contacts } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
import {
  scrapeInstagramProfile,
  scrapeWebsite,
} from '../../utils/scraper'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { contactId } = body

  if (!contactId) {
    throw createError({ statusCode: 400, message: 'contactId required' })
  }

  const contact = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .get()

  if (!contact) {
    throw createError({ statusCode: 404, message: 'Contact not found' })
  }

  const updates: Record<string, any> = {}

  // Scrape Instagram profile
  if (contact.instagram_handle) {
    const igData = await scrapeInstagramProfile(contact.instagram_handle)
    if (igData) {
      if (igData.followers && !contact.instagram_followers) {
        updates.instagram_followers = igData.followers
      }
      if (igData.email && !contact.email) {
        updates.email = igData.email
      }
      if (igData.website && !contact.website) {
        updates.website = igData.website
      }
    }
  }

  // Scrape website
  if (contact.website) {
    const webData = await scrapeWebsite(contact.website)
    if (webData) {
      if (webData.emails.length > 0 && !contact.email) {
        updates.email = webData.emails[0]
      }
      if (webData.phones.length > 0 && !contact.phone) {
        updates.phone = webData.phones[0]
      }
      // Extract Instagram handle from social links
      if (!contact.instagram_handle) {
        const igLink = webData.socialLinks.find((l) =>
          l.includes('instagram.com')
        )
        if (igLink) {
          const match = igLink.match(/instagram\.com\/([^/?]+)/)
          if (match) {
            updates.instagram_handle = match[1].toLowerCase()
            updates.instagram_url = igLink
          }
        }
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    updates.updated_at = sql`datetime('now')`
    await db.update(contacts).set(updates).where(eq(contacts.id, contactId)).run()
  }

  const updated = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .get()

  return {
    ...updated,
    enrichedFields: Object.keys(updates).filter((k) => k !== 'updated_at'),
  }
})
