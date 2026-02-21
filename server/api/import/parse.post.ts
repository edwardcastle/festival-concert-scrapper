import { parseFileBuffer, autoMapColumns } from '../../utils/file-parser'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  const file = formData.find((f) => f.name === 'file')
  if (!file || !file.data) {
    throw createError({ statusCode: 400, message: 'No file found' })
  }

  const fileName = file.filename || 'data.csv'

  try {
    const parsed = parseFileBuffer(Buffer.from(file.data), fileName)
    const mapping = autoMapColumns(parsed.headers)

    return {
      headers: parsed.headers,
      rows: parsed.rows.slice(0, 200), // Preview max 200 rows
      totalRows: parsed.rows.length,
      mapping,
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      message: `Failed to parse file: ${e.message}`,
    })
  }
})
