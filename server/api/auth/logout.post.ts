import {
  getSessionFromEvent,
  destroySession,
  clearSessionCookie,
} from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getSessionFromEvent(event)
  if (token) {
    destroySession(token)
  }
  clearSessionCookie(event)
  return { success: true }
})
