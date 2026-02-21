export interface InstagramProfile {
  followers?: string
  bio?: string
  email?: string
  website?: string
}

export interface WebsiteData {
  emails: string[]
  phones: string[]
  socialLinks: string[]
}

let browser: any = null

async function getBrowser(): Promise<any> {
  if (browser && browser.isConnected()) return browser

  try {
    const pw = await import('playwright-chromium')
    browser = await pw.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    return browser
  } catch {
    return null
  }
}

export async function scrapeInstagramProfile(
  handle: string
): Promise<InstagramProfile | null> {
  const b = await getBrowser()
  if (!b) return null

  let page = null
  try {
    page = await b.newPage()
    page.setDefaultTimeout(15000)

    await page.goto(`https://www.instagram.com/${handle}/`, {
      waitUntil: 'domcontentloaded',
    })

    const description = await page
      .$eval('meta[property="og:description"]', (el: any) =>
        el.getAttribute('content')
      )
      .catch(() => null)

    const result: InstagramProfile = {}

    if (description) {
      const followersMatch = description.match(
        /([\d,.]+[KMB]?)\s*Followers/i
      )
      if (followersMatch) {
        result.followers = followersMatch[1]
      }

      const bioParts = description.split(' - ')
      if (bioParts.length > 1) {
        const bio = bioParts.slice(1).join(' - ').trim()
        result.bio = bio

        const emailMatch = bio.match(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        )
        if (emailMatch) {
          result.email = emailMatch[0]
        }
      }
    }

    const externalUrl = await page
      .$eval('a[href*="l.instagram.com"]', (el: any) => el.getAttribute('href'))
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

export async function scrapeWebsite(
  url: string
): Promise<WebsiteData | null> {
  const b = await getBrowser()
  if (!b) return null

  let page = null
  try {
    page = await b.newPage()
    page.setDefaultTimeout(15000)

    await page.goto(url, { waitUntil: 'domcontentloaded' })

    const content = await page.content()

    const emailMatches = content.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    )
    const emails = [
      ...new Set(
        (emailMatches || []).filter(
          (e: string) => !e.includes('example.com') && !e.includes('sentry')
        )
      ),
    ]

    const phoneMatches = content.match(
      /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g
    )
    const phones = [...new Set(phoneMatches || [])]

    const socialLinks = await page.$$eval(
      'a[href*="instagram.com"], a[href*="facebook.com"], a[href*="twitter.com"], a[href*="tiktok.com"]',
      (els: any[]) => els.map((el: any) => el.getAttribute('href')).filter(Boolean)
    )

    return {
      emails: emails.slice(0, 5),
      phones: phones.slice(0, 3),
      socialLinks: [...new Set(socialLinks)] as string[],
    }
  } catch (e) {
    console.error(`Failed to scrape website ${url}:`, e)
    return null
  } finally {
    if (page) await page.close().catch(() => {})
  }
}
