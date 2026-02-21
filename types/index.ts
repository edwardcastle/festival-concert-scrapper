export type ContactType = 'promoter' | 'festival' | 'venue' | 'club' | 'media' | 'agency'

export type ContactStatus =
  | 'new'
  | 'researched'
  | 'contacted'
  | 'responded'
  | 'negotiating'
  | 'booked'
  | 'rejected'
  | 'inactive'

export type Priority = 0 | 1 | 2

export type NoteType = 'note' | 'email_sent' | 'email_received' | 'call' | 'meeting'

export interface Contact {
  id: number
  name: string
  type: ContactType | null
  instagram_handle: string | null
  instagram_url: string | null
  instagram_followers: string | null
  email: string | null
  phone: string | null
  website: string | null
  city: string | null
  country: string | null
  region: string | null
  event_type: string | null
  genres: string | null
  capacity: string | null
  dates_2026: string | null
  lineup_artists: string | null
  cuban_connection: string | null
  status: ContactStatus
  contacted_date: string | null
  contacted_via: string | null
  response_notes: string | null
  admin_notes: string | null
  priority: Priority
  tags: string | null
  source: string | null
  source_query: string | null
  raw_data: string | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  contact_id: number
  content: string
  type: NoteType
  created_at: string
}

export interface SearchHistoryEntry {
  id: number
  query: string
  results_count: number
  new_contacts: number
  created_at: string
}

export interface ContactFilters {
  search?: string
  status?: string | string[]
  country?: string | string[]
  type?: string
  priority?: string
  cuban_connection?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type DedupResult = 'exact_match' | 'possible_duplicate' | 'new'

export interface DedupCheck {
  status: DedupResult
  existingContact?: Contact
  matchField?: string
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
  position: number
  extracted: Partial<Contact>[]
  extractionMode: 'ai' | 'rule-based'
}

export interface SearchResultWithDedup extends SearchResult {
  contacts: Array<{
    data: Partial<Contact>
    dedup: DedupCheck
  }>
}
