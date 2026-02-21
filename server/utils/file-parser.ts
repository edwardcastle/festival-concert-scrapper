import * as XLSX from 'xlsx'

export interface ParsedFile {
  headers: string[]
  rows: Record<string, any>[]
}

export function parseFileBuffer(
  buffer: Buffer,
  fileName: string
): ParsedFile {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: '',
  })

  if (jsonData.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = Object.keys(jsonData[0])

  return { headers, rows: jsonData }
}

// Spanish alias mapping
const COLUMN_ALIASES: Record<string, string> = {
  nombre: 'name',
  name: 'name',
  tipo: 'type',
  type: 'type',
  correo: 'email',
  email: 'email',
  'correo electrónico': 'email',
  'correo electronico': 'email',
  teléfono: 'phone',
  telefono: 'phone',
  phone: 'phone',
  ciudad: 'city',
  city: 'city',
  país: 'country',
  pais: 'country',
  country: 'country',
  región: 'region',
  region: 'region',
  instagram: 'instagram_handle',
  instagram_handle: 'instagram_handle',
  'instagram handle': 'instagram_handle',
  'instagram url': 'instagram_url',
  instagram_url: 'instagram_url',
  seguidores: 'instagram_followers',
  followers: 'instagram_followers',
  instagram_followers: 'instagram_followers',
  web: 'website',
  website: 'website',
  'sitio web': 'website',
  géneros: 'genres',
  generos: 'genres',
  genres: 'genres',
  género: 'genres',
  genero: 'genres',
  capacidad: 'capacity',
  capacity: 'capacity',
  'tipo evento': 'event_type',
  'event type': 'event_type',
  event_type: 'event_type',
  fechas: 'dates_2026',
  dates: 'dates_2026',
  dates_2026: 'dates_2026',
  artistas: 'lineup_artists',
  lineup: 'lineup_artists',
  lineup_artists: 'lineup_artists',
  'conexión cubana': 'cuban_connection',
  'conexion cubana': 'cuban_connection',
  cuban_connection: 'cuban_connection',
  'cuban connection': 'cuban_connection',
  estado: 'status',
  status: 'status',
  prioridad: 'priority',
  priority: 'priority',
  etiquetas: 'tags',
  tags: 'tags',
  fuente: 'source',
  source: 'source',
  notas: 'admin_notes',
  notes: 'admin_notes',
  admin_notes: 'admin_notes',
}

export function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  for (const header of headers) {
    const normalized = header.toLowerCase().trim()
    if (COLUMN_ALIASES[normalized]) {
      mapping[header] = COLUMN_ALIASES[normalized]
    }
  }

  return mapping
}
