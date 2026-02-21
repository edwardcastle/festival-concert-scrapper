import { createHash, createHmac } from 'crypto'
import type { H3Event } from 'h3'

function getSessionSecret(): string {
  const config = useRuntimeConfig()
  return config.sessionSecret as string
}

function getAdminPassword(): string {
  const config = useRuntimeConfig()
  return config.adminPassword as string
}

export function verifyPassword(password: string): boolean {
  return password === getAdminPassword()
}

// Stateless signed token — works on serverless
export function createSessionToken(): string {
  const payload = `authenticated:${Date.now()}`
  const signature = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex')
  return `${Buffer.from(payload).toString('base64')}.${signature}`
}

export function validateSession(token: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.')
    if (!payloadB64 || !signature) return false

    const payload = Buffer.from(payloadB64, 'base64').toString()
    const expected = createHmac('sha256', getSessionSecret())
      .update(payload)
      .digest('hex')

    if (signature !== expected) return false

    // Check if token is less than 7 days old
    const match = payload.match(/authenticated:(\d+)/)
    if (!match) return false
    const age = Date.now() - Number(match[1])
    return age < 7 * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function getSessionFromEvent(event: H3Event): string | null {
  return getCookie(event, 'session') || null
}

export function setSessionCookie(event: H3Event, token: string): void {
  setCookie(event, 'session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, 'session', { path: '/' })
}
