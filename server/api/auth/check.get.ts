import { getSessionFromEvent, validateSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getSessionFromEvent(event)
  const authenticated = !!token && validateSession(token)
  return { authenticated }
})
