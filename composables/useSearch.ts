import type { SearchContact } from '~/types'

export const useSearch = () => {
  const contacts = useState<SearchContact[]>('search-contacts', () => [])
  const loading = useState('search-loading', () => false)
  const mode = useState<'ai' | 'rule-based' | ''>('search-mode', () => '')
  const error = useState<string>('search-error', () => '')
  const searchCount = useState<number>('search-count', () => 0)

  const search = async (query: string) => {
    loading.value = true
    error.value = ''
    contacts.value = []

    try {
      const res = await $fetch<{
        contacts: SearchContact[]
        mode: 'ai' | 'rule-based'
        searchCount: number
      }>('/api/search', {
        method: 'POST',
        body: { query },
      })

      contacts.value = res.contacts
      mode.value = res.mode
      searchCount.value = res.searchCount
    } catch (e: any) {
      error.value = e.data?.message || 'Search failed'
    } finally {
      loading.value = false
    }
  }

  const addContact = async (contact: SearchContact, sourceQuery: string) => {
    return await $fetch('/api/search/add', {
      method: 'POST',
      body: {
        name: contact.name,
        type: contact.type,
        instagram_handle: contact.instagram_handle,
        instagram_url: contact.instagram_url,
        instagram_followers: contact.instagram_followers,
        email: contact.email,
        phone: contact.phone,
        website: contact.website,
        city: contact.city,
        country: contact.country,
        genres: contact.genres,
        cuban_connection: contact.cuban_connection,
        event_type: contact.event_type,
        source: 'search',
        source_query: sourceQuery,
      },
    })
  }

  const addAllNew = async (sourceQuery: string) => {
    const newContacts = contacts.value
      .filter((c) => c.dedup.status === 'new' && !c._added)
      .map((c) => ({
        name: c.name,
        type: c.type,
        instagram_handle: c.instagram_handle,
        instagram_url: c.instagram_url,
        instagram_followers: c.instagram_followers,
        email: c.email,
        phone: c.phone,
        website: c.website,
        city: c.city,
        country: c.country,
        genres: c.genres,
        cuban_connection: c.cuban_connection,
        event_type: c.event_type,
        source: 'search',
        source_query: sourceQuery,
      }))

    if (newContacts.length === 0) return { inserted: 0, skipped: 0 }

    return await $fetch('/api/search/add', {
      method: 'POST',
      body: newContacts,
    })
  }

  return { contacts, loading, mode, error, searchCount, search, addContact, addAllNew }
}
