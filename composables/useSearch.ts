import type { SearchResultWithDedup } from '~/types'

export const useSearch = () => {
  const results = useState<SearchResultWithDedup[]>('search-results', () => [])
  const loading = useState('search-loading', () => false)
  const mode = useState<'ai' | 'rule-based' | ''>('search-mode', () => '')
  const error = useState<string>('search-error', () => '')

  const search = async (query: string) => {
    loading.value = true
    error.value = ''
    results.value = []

    try {
      const res = await $fetch<{
        results: SearchResultWithDedup[]
        mode: 'ai' | 'rule-based'
      }>('/api/search', {
        method: 'POST',
        body: { query },
      })

      results.value = res.results
      mode.value = res.mode
    } catch (e: any) {
      error.value = e.data?.message || 'Search failed'
    } finally {
      loading.value = false
    }
  }

  const addContact = async (data: any, sourceQuery: string) => {
    return await $fetch('/api/search/add', {
      method: 'POST',
      body: { ...data, source: 'search', source_query: sourceQuery },
    })
  }

  const addAllNew = async (sourceQuery: string) => {
    const newContacts = results.value
      .flatMap((r) => r.contacts)
      .filter((c) => c.dedup.status === 'new')
      .map((c) => ({
        ...c.data,
        source: 'search',
        source_query: sourceQuery,
      }))

    if (newContacts.length === 0) return { inserted: 0, skipped: 0 }

    return await $fetch('/api/search/add', {
      method: 'POST',
      body: newContacts,
    })
  }

  return { results, loading, mode, error, search, addContact, addAllNew }
}
