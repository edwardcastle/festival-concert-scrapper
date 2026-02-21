import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = body

  if (!password || !verifyPassword(password)) {
    throw createError({ statusCode: 401, message: 'Invalid password' })
  }

  const token = createSessionToken()
  setSessionCookie(event, token)

  return { success: true }
})
