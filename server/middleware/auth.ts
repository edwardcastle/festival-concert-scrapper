import { getSessionFromEvent, validateSession } from '../utils/auth'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Skip auth for login endpoint and non-API routes
  if (!path.startsWith('/api/') || path === '/api/auth/login' || path === '/api/auth/check') {
    return
  }

  const token = getSessionFromEvent(event)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
})
