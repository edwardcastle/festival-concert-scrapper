<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 mb-4">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-white">Contacts</h1>
        <p class="text-xs md:text-sm text-[var(--color-text-muted)]">
          {{ total }} contact{{ total !== 1 ? 's' : '' }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          icon="pi pi-download"
          severity="secondary"
          size="small"
          @click="handleExport"
          v-tooltip="'Export'"
        />
        <Button
          label="Add"
          icon="pi pi-plus"
          severity="info"
          size="small"
          @click="showAddDialog = true"
        />
      </div>
    </div>

    <!-- Filter bar -->
    <div
      class="flex flex-wrap gap-2 mb-4 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg"
    >
      <IconField class="flex-1 min-w-0">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="filters.search"
          placeholder="Search..."
          class="w-full"
          @keyup.enter="applyFilters"
        />
      </IconField>
      <MultiSelect
        v-model="filters.status"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Status"
        class="w-28 md:w-36"
        @change="applyFilters"
      />
      <MultiSelect
        v-model="filters.country"
        :options="countryOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Country"
        class="w-28 md:w-36 hidden sm:flex"
        filter
        @change="applyFilters"
      />
      <Select
        v-model="filters.type"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Type"
        showClear
        class="w-28 md:w-32 hidden sm:flex"
        @change="applyFilters"
      />
      <ToggleButton
        v-model="cubanToggle"
        onLabel="Cuban ★"
        offLabel="Cuban"
        onIcon="pi pi-star-fill"
        offIcon="pi pi-star"
        class="w-24 hidden md:flex"
        @change="handleCubanToggle"
      />
      <Button
        icon="pi pi-filter-slash"
        severity="secondary"
        size="small"
        @click="resetFilters"
        v-tooltip="'Clear filters'"
      />
    </div>

    <!-- Bulk actions -->
    <div
      v-if="selectedContacts.length > 0"
      class="flex flex-wrap items-center gap-2 mb-4 p-3 bg-[var(--color-electric-blue)]/10 border border-[var(--color-electric-blue)]/30 rounded-lg"
    >
      <span class="text-sm text-[var(--color-electric-blue)]">
        {{ selectedContacts.length }} selected
      </span>
      <Select
        v-model="bulkStatus"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Status"
        size="small"
        class="w-32"
      />
      <Button
        label="Apply"
        size="small"
        severity="info"
        :disabled="!bulkStatus"
        @click="handleBulkStatus"
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        @click="handleBulkDelete"
        v-tooltip="'Delete selected'"
      />
    </div>

    <!-- Mobile: Card View -->
    <div class="md:hidden space-y-3">
      <div v-if="loading" class="flex justify-center py-8">
        <ProgressSpinner />
      </div>

      <div v-else-if="contacts.length === 0" class="text-center py-12">
        <i class="pi pi-users text-4xl text-[var(--color-text-muted)] mb-3" />
        <p class="text-[var(--color-text-muted)]">No contacts found</p>
        <Button
          label="Add your first contact"
          severity="info"
          size="small"
          class="mt-3"
          @click="showAddDialog = true"
        />
      </div>

      <div
        v-for="c in contacts"
        :key="c.id"
        class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
        :class="{
          'border-l-4 border-l-blue-500': c.status === 'contacted',
          'border-l-4 border-l-green-500': c.status === 'responded',
          'border-l-4 border-l-yellow-500': c.status === 'booked',
        }"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <NuxtLink
            :to="`/contacts/${c.id}`"
            class="text-[var(--color-electric-blue)] font-semibold text-base hover:underline"
          >
            {{ c.name }}
            <i
              v-if="c.cuban_connection"
              class="pi pi-star-fill text-[var(--color-gold)] text-xs ml-1"
            />
          </NuxtLink>
          <StatusBadge :status="c.status" />
        </div>

        <div class="space-y-1.5 text-sm">
          <div v-if="c.instagram_handle" class="flex items-center gap-2">
            <i class="pi pi-instagram text-[var(--color-electric-blue)] text-xs w-4" />
            <a
              :href="c.instagram_url || `https://instagram.com/${c.instagram_handle}`"
              target="_blank"
              class="text-[var(--color-electric-blue)] hover:underline"
            >
              @{{ c.instagram_handle }}
            </a>
          </div>
          <div v-if="c.email" class="flex items-center gap-2">
            <i class="pi pi-envelope text-[var(--color-text-muted)] text-xs w-4" />
            <a :href="`mailto:${c.email}`" class="text-[var(--color-text-muted)] hover:text-white truncate">
              {{ c.email }}
            </a>
          </div>
          <div v-if="c.phone" class="flex items-center gap-2">
            <i class="pi pi-whatsapp text-green-400 text-xs w-4" />
            <a
              :href="`https://wa.me/${c.phone.replace(/[^0-9+]/g, '')}`"
              target="_blank"
              class="text-green-400 hover:underline"
            >
              {{ c.phone }}
            </a>
          </div>
          <div v-if="c.city || c.country" class="flex items-center gap-2 text-[var(--color-text-muted)]">
            <i class="pi pi-map-marker text-xs w-4" />
            <span>{{ [c.city, c.country].filter(Boolean).join(', ') }}</span>
          </div>
          <div v-if="c.event_type || c.type" class="flex items-center gap-2 text-[var(--color-text-muted)]">
            <i class="pi pi-tag text-xs w-4" />
            <span class="capitalize">{{ c.event_type || c.type }}</span>
          </div>
        </div>
      </div>

      <!-- Mobile pagination -->
      <div v-if="contacts.length > 0" class="flex items-center justify-between pt-2">
        <Button
          icon="pi pi-chevron-left"
          severity="secondary"
          size="small"
          :disabled="page <= 1"
          @click="setPage(page - 1)"
        />
        <span class="text-sm text-[var(--color-text-muted)]">
          Page {{ page }} / {{ Math.ceil(total / limit) || 1 }}
        </span>
        <Button
          icon="pi pi-chevron-right"
          severity="secondary"
          size="small"
          :disabled="page >= Math.ceil(total / limit)"
          @click="setPage(page + 1)"
        />
      </div>
    </div>

    <!-- Desktop: DataTable -->
    <div class="hidden md:block">
      <DataTable
        v-model:selection="selectedContacts"
        :value="contacts"
        :loading="loading"
        :lazy="true"
        :paginator="true"
        :rows="limit"
        :totalRecords="total"
        :first="(page - 1) * limit"
        @page="onPage"
        @sort="onSort"
        :rowClass="rowClass"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        removableSort
        scrollable
        scrollHeight="calc(100vh - 340px)"
        class="rounded-lg overflow-hidden border border-[var(--color-border)]"
        dataKey="id"
      >
        <template #empty>
          <div class="text-center py-12">
            <i class="pi pi-users text-4xl text-[var(--color-text-muted)] mb-3" />
            <p class="text-[var(--color-text-muted)]">No contacts found</p>
            <Button
              label="Add your first contact"
              severity="info"
              size="small"
              class="mt-3"
              @click="showAddDialog = true"
            />
          </div>
        </template>

        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column field="name" header="Name" sortable style="min-width: 180px">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <NuxtLink
                :to="`/contacts/${data.id}`"
                class="text-[var(--color-electric-blue)] hover:underline font-medium"
              >
                {{ data.name }}
              </NuxtLink>
              <i
                v-if="data.cuban_connection"
                class="pi pi-star-fill text-[var(--color-gold)] text-xs"
                v-tooltip="data.cuban_connection"
              />
            </div>
          </template>
        </Column>

        <Column field="instagram_handle" header="Instagram" style="min-width: 150px">
          <template #body="{ data }">
            <a
              v-if="data.instagram_handle"
              :href="data.instagram_url || `https://instagram.com/${data.instagram_handle}`"
              target="_blank"
              class="text-[var(--color-electric-blue)] hover:underline text-sm"
            >
              @{{ data.instagram_handle }}
            </a>
            <span v-else class="text-[var(--color-text-muted)]">—</span>
          </template>
        </Column>

        <Column field="email" header="Email / Contact" style="min-width: 180px">
          <template #body="{ data }">
            <a
              v-if="data.email"
              :href="`mailto:${data.email}`"
              class="text-sm text-[var(--color-electric-blue)] hover:underline"
            >
              {{ data.email }}
            </a>
            <span v-else class="text-[var(--color-text-muted)]">—</span>
          </template>
        </Column>

        <Column field="phone" header="WhatsApp / Phone" style="min-width: 140px">
          <template #body="{ data }">
            <a
              v-if="data.phone"
              :href="`https://wa.me/${data.phone.replace(/[^0-9+]/g, '')}`"
              target="_blank"
              class="text-sm text-green-400 hover:underline"
            >
              {{ data.phone }}
            </a>
            <span v-else class="text-[var(--color-text-muted)]">—</span>
          </template>
        </Column>

        <Column field="city" header="City" sortable style="min-width: 100px" />
        <Column field="country" header="Country" sortable style="min-width: 110px" />

        <Column field="event_type" header="Event Type" sortable style="min-width: 110px">
          <template #body="{ data }">
            <span class="capitalize text-sm">{{ data.event_type || data.type || '—' }}</span>
          </template>
        </Column>

        <Column field="status" header="Status" sortable style="min-width: 110px">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>

        <Column field="admin_notes" header="Notes" style="min-width: 160px">
          <template #body="{ data }">
            <span v-if="data.admin_notes" class="text-xs text-[var(--color-text-muted)] line-clamp-2">
              {{ data.admin_notes }}
            </span>
            <span v-else class="text-[var(--color-text-muted)]">—</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add Contact Dialog -->
    <Dialog
      v-model:visible="showAddDialog"
      header="Add Contact"
      :modal="true"
      :style="{ width: '95vw', maxWidth: '700px' }"
      :closable="true"
      :breakpoints="{ '640px': '100vw' }"
    >
      <ContactForm v-model="newContact" />
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="showAddDialog = false"
        />
        <Button
          label="Save"
          severity="info"
          :loading="saving"
          @click="handleAddContact"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import ToggleButton from 'primevue/togglebutton'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import type { Contact, ContactStatus } from '~/types'

const toast = useToast()
const {
  contacts,
  total,
  page,
  limit,
  loading,
  filters,
  fetchContacts,
  createContact,
  bulkUpdateStatus,
  deleteContact,
  applyFilters,
  resetFilters,
  setSort,
  setPage,
} = useContacts()

const selectedContacts = ref<Contact[]>([])
const bulkStatus = ref('')
const cubanToggle = ref(false)
const showAddDialog = ref(false)
const saving = ref(false)
const newContact = ref<Partial<Contact>>({
  status: 'new' as ContactStatus,
  priority: 0,
})

onMounted(() => {
  fetchContacts()
})

const statusOptions = [
  { label: 'New', value: 'new' },
  { label: 'Researched', value: 'researched' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Responded', value: 'responded' },
  { label: 'Negotiating', value: 'negotiating' },
  { label: 'Booked', value: 'booked' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Inactive', value: 'inactive' },
]

const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'Promoter', value: 'promoter' },
  { label: 'Festival', value: 'festival' },
  { label: 'Venue', value: 'venue' },
  { label: 'Club', value: 'club' },
  { label: 'Media', value: 'media' },
  { label: 'Agency', value: 'agency' },
]

const countryOptions = computed(() => {
  const countries = [
    'Spain', 'Italy', 'France', 'Germany', 'Netherlands', 'Belgium',
    'Portugal', 'UK', 'Switzerland', 'Austria', 'Poland', 'Czech Republic',
    'Sweden', 'Denmark', 'Norway', 'Finland', 'Greece', 'Croatia',
    'Hungary', 'Romania', 'Cuba', 'Mexico', 'Colombia', 'Argentina',
    'Chile', 'Peru', 'Brazil', 'Dominican Republic', 'Puerto Rico', 'Panama',
  ]
  return countries.map((c) => ({ label: c, value: c }))
})

function onPage(event: any) {
  setPage(event.page + 1)
  limit.value = event.rows
}

function onSort(event: any) {
  if (event.sortField) {
    setSort(event.sortField, event.sortOrder === 1 ? 'asc' : 'desc')
  }
}

function handleCubanToggle() {
  filters.value.cuban_connection = cubanToggle.value ? 'true' : ''
  applyFilters()
}

function rowClass(data: Contact) {
  const classes: Record<string, boolean> = {
    'bg-blue-950/30!': data.status === 'contacted',
    'bg-green-950/30!': data.status === 'responded',
    'bg-yellow-950/20!': data.status === 'booked',
    'bg-gray-900/30!': data.status === 'rejected',
  }
  return Object.entries(classes)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(' ')
}

async function handleAddContact() {
  if (!newContact.value.name) {
    toast.add({ severity: 'error', summary: 'Name is required', life: 3000 })
    return
  }
  saving.value = true
  try {
    await createContact(newContact.value)
    showAddDialog.value = false
    newContact.value = { status: 'new' as ContactStatus, priority: 0 }
    toast.add({ severity: 'success', summary: 'Contact added', life: 3000 })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: e.data?.message || 'Failed to add contact',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

async function handleBulkStatus() {
  if (!bulkStatus.value || selectedContacts.value.length === 0) return
  const ids = selectedContacts.value.map((c) => c.id)
  await bulkUpdateStatus(ids, bulkStatus.value)
  selectedContacts.value = []
  bulkStatus.value = ''
  toast.add({ severity: 'success', summary: 'Status updated', life: 3000 })
}

async function handleBulkDelete() {
  const ids = selectedContacts.value.map((c) => c.id)
  await $fetch('/api/contacts/bulk-delete', {
    method: 'POST',
    body: { ids },
  })
  selectedContacts.value = []
  await fetchContacts()
  toast.add({ severity: 'success', summary: `Deleted ${ids.length} contacts`, life: 3000 })
}

async function handleExport() {
  try {
    const res = await $fetch('/api/contacts/export', {
      method: 'POST',
      body: { format: 'csv', filters: filters.value },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    toast.add({ severity: 'error', summary: 'Export failed', life: 3000 })
  }
}
</script>
