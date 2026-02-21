import { ensureDb } from '../db'

export default defineNitroPlugin(async () => {
  await ensureDb()
})
