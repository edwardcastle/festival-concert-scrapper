import type { Contact, ContactFilters, PaginatedResponse } from '~/types'

export const useContacts = () => {
  const contacts = useState<Contact[]>('contacts', () => [])
  const total = useState('contacts-total', () => 0)
  const page = useState('contacts-page', () => 1)
  const limit = useState('contacts-limit', () => 25)
  const totalPages = useState('contacts-totalPages', () => 0)
  const loading = useState('contacts-loading', () => false)
  const filters = useState<ContactFilters>('contacts-filters', () => ({
    search: '',
    status: [],
    country: [],
    type: '',
    priority: '',
    cuban_connection: '',
    sort: 'updated_at',
    order: 'desc' as const,
  }))

  const fetchContacts = async () => {
    loading.value = true
    try {
      const params: any = {
        page: page.value,
        limit: limit.value,
        sort: filters.value.sort,
        order: filters.value.order,
      }

      if (filters.value.search) params.search = filters.value.search
      if (filters.value.status && (filters.value.status as string[]).length > 0)
        params.status = filters.value.status
      if (filters.value.country && (filters.value.country as string[]).length > 0)
        params.country = filters.value.country
      if (filters.value.type) params.type = filters.value.type
      if (filters.value.priority !== undefined && filters.value.priority !== '')
        params.priority = filters.value.priority
      if (filters.value.cuban_connection)
        params.cuban_connection = filters.value.cuban_connection

      const res = await $fetch<PaginatedResponse<Contact>>('/api/contacts', {
        params,
      })
      contacts.value = res.data
      total.value = res.total
      totalPages.value = res.totalPages
    } catch (e) {
      console.error('Failed to fetch contacts:', e)
    } finally {
      loading.value = false
    }
  }

  const createContact = async (data: Partial<Contact>) => {
    const res = await $fetch('/api/contacts', {
      method: 'POST',
      body: data,
    })
    await fetchContacts()
    return res
  }

  const updateContact = async (id: number, data: Partial<Contact>) => {
    const res = await $fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      body: data,
    })
    await fetchContacts()
    return res
  }

  const deleteContact = async (id: number) => {
    await $fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    await fetchContacts()
  }

  const bulkUpdateStatus = async (ids: number[], status: string) => {
    await $fetch('/api/contacts/bulk-status', {
      method: 'PUT',
      body: { ids, status },
    })
    await fetchContacts()
  }

  const setPage = (p: number) => {
    page.value = p
    fetchContacts()
  }

  const setSort = (field: string, order: 'asc' | 'desc') => {
    filters.value.sort = field
    filters.value.order = order
    page.value = 1
    fetchContacts()
  }

  const applyFilters = () => {
    page.value = 1
    fetchContacts()
  }

  const resetFilters = () => {
    filters.value = {
      search: '',
      status: [],
      country: [],
      type: '',
      priority: '',
      cuban_connection: '',
      sort: 'updated_at',
      order: 'desc',
    }
    page.value = 1
    fetchContacts()
  }

  return {
    contacts,
    total,
    page,
    limit,
    totalPages,
    loading,
    filters,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    bulkUpdateStatus,
    setPage,
    setSort,
    applyFilters,
    resetFilters,
  }
}
