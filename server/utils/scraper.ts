import type { Browser } from 'playwright-chromium'

let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) return browser

  const { chromium } = await import('playwright-chromium')
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  return browser
}

export interface InstagramProfile {
  followers?: string
  bio?: string
  email?: string
  website?: string
}

export async function scrapeInstagramProfile(
  handle: string
): Promise<InstagramProfile | null> {
  let page = null
  try {
    const b = await getBrowser()
    page = await b.newPage()
    page.setDefaultTimeout(15000)

    await page.goto(`https://www.instagram.com/${handle}/`, {
      waitUntil: 'domcontentloaded',
    })

    // Extract from meta tags
    const description = await page
      .$eval('meta[property="og:description"]', (el) =>
        el.getAttribute('content')
      )
      .catch(() => null)

    const result: InstagramProfile = {}

    if (description) {
      // Parse followers from "X Followers, Y Following, Z Posts"
      const followersMatch = description.match(
        /([\d,.]+[KMB]?)\s*Followers/i
      )
      if (followersMatch) {
        result.followers = followersMatch[1]
      }

      // Extract bio part after the counts
      const bioParts = description.split(' - ')
      if (bioParts.length > 1) {
        const bio = bioParts.slice(1).join(' - ').trim()
        result.bio = bio

        // Extract email from bio
        const emailMatch = bio.match(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        )
        if (emailMatch) {
          result.email = emailMatch[0]
        }
      }
    }

    // Try to get external URL
    const externalUrl = await page
      .$eval('a[href*="l.instagram.com"]', (el) => el.getAttribute('href'))
      .catch(() => null)

    if (externalUrl) {
      try {
        const url = new URL(externalUrl)
        const redirect = url.searchParams.get('u')
        if (redirect) result.website = redirect
      } catch {}
    }

    return result
  } catch (e) {
    console.error(`Failed to scrape Instagram profile @${handle}:`, e)
    return null
  } finally {
    if (page) await page.close().catch(() => {})
  }
}

export interface WebsiteData {
  emails: string[]
  phones: string[]
  socialLinks: string[]
}

export async function scrapeWebsite(
  url: string
): Promise<WebsiteData | null> {
  let page = null
  try {
    const b = await getBrowser()
    page = await b.newPage()
    page.setDefaultTimeout(15000)

    await page.goto(url, { waitUntil: 'domcontentloaded' })

    const content = await page.content()

    // Extract emails
    const emailMatches = content.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    )
    const emails = [
      ...new Set(
        (emailMatches || []).filter(
          (e) => !e.includes('example.com') && !e.includes('sentry')
        )
      ),
    ]

    // Extract phone numbers
    const phoneMatches = content.match(
      /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g
    )
    const phones = [...new Set(phoneMatches || [])]

    // Extract social links
    const socialLinks = await page.$$eval(
      'a[href*="instagram.com"], a[href*="facebook.com"], a[href*="twitter.com"], a[href*="tiktok.com"]',
      (els) => els.map((el) => el.getAttribute('href')).filter(Boolean) as string[]
    )

    return {
      emails: emails.slice(0, 5),
      phones: phones.slice(0, 3),
      socialLinks: [...new Set(socialLinks)],
    }
  } catch (e) {
    console.error(`Failed to scrape website ${url}:`, e)
    return null
  } finally {
    if (page) await page.close().catch(() => {})
  }
}
