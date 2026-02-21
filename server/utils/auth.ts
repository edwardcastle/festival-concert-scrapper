import { createHash, randomBytes } from 'crypto'
import type { H3Event } from 'h3'

const sessions = new Map<string, { createdAt: number }>()

function getSessionSecret(): string {
  const config = useRuntimeConfig()
  return config.sessionSecret as string
}

function getAdminPassword(): string {
  const config = useRuntimeConfig()
  return config.adminPassword as string
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password: string): boolean {
  return password === getAdminPassword()
}

export function createSession(): string {
  const token = randomBytes(32).toString('hex')
  const hash = createHash('sha256')
    .update(token + getSessionSecret())
    .digest('hex')
  sessions.set(hash, { createdAt: Date.now() })
  return hash
}

export function validateSession(token: string): boolean {
  return sessions.has(token)
}

export function destroySession(token: string): void {
  sessions.delete(token)
}

export function getSessionFromEvent(event: H3Event): string | null {
  return getCookie(event, 'session') || null
}

export function setSessionCookie(event: H3Event, token: string): void {
  setCookie(event, 'session', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, 'session', { path: '/' })
}
