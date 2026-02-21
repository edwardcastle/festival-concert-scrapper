<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-6">Search & Discover</h1>

    <!-- Search input -->
    <div class="max-w-2xl mx-auto mb-8">
      <div class="relative">
        <IconField class="w-full">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="query"
            placeholder="Search for Latin music promoters, festivals, venues..."
            class="w-full text-lg"
            @keyup.enter="handleSearch"
          />
        </IconField>
      </div>

      <!-- Suggested queries -->
      <div class="flex flex-wrap gap-2 mt-3">
        <Button
          v-for="suggestion in suggestions"
          :key="suggestion"
          :label="suggestion"
          severity="secondary"
          size="small"
          text
          class="text-xs"
          @click="query = suggestion; handleSearch()"
        />
      </div>
    </div>

    <!-- Mode badge + stats -->
    <div v-if="mode" class="flex items-center justify-center gap-2 mb-4">
      <Tag
        :value="mode === 'ai' ? 'AI Extracted' : 'Auto-extracted — review recommended'"
        :severity="mode === 'ai' ? 'success' : 'warn'"
      />
      <span class="text-sm text-[var(--color-text-muted)]">
        {{ contacts.length }} contacts found from {{ searchCount }} Google results
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center py-12">
      <ProgressSpinner />
      <p class="text-sm text-[var(--color-text-muted)] mt-4">
        Searching Google + Instagram and extracting contacts...
      </p>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="max-w-md mx-auto text-center py-8"
    >
      <i class="pi pi-exclamation-triangle text-3xl text-[var(--color-gold)] mb-3" />
      <p class="text-sm text-[var(--color-red)]">{{ error }}</p>
    </div>

    <!-- Results -->
    <div v-if="contacts.length > 0" class="space-y-3">
      <!-- Bulk add button -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-[var(--color-text-muted)]">
          {{ newCount }} new contacts ready to add
        </span>
        <Button
          :label="`Add All New (${newCount})`"
          icon="pi pi-plus"
          severity="info"
          size="small"
          :disabled="newCount === 0"
          :loading="addingAll"
          @click="handleAddAll"
        />
      </div>

      <SearchResultCard
        v-for="(contact, i) in contacts"
        :key="i"
        :contact="contact"
        @add="handleAdd(contact)"
      />
    </div>

    <!-- Empty state -->
    <div v-if="!loading && mode && contacts.length === 0" class="text-center py-12">
      <i class="pi pi-search text-4xl text-[var(--color-text-muted)] mb-3" />
      <p class="text-[var(--color-text-muted)]">No contacts found. Try a different query.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import type { SearchContact } from '~/types'

const toast = useToast()
const { contacts, loading, mode, error, searchCount, search, addContact, addAllNew } =
  useSearch()

const query = ref('')
const addingAll = ref(false)

const suggestions = [
  'promotores música latina España',
  'festival reggaeton Europe 2026',
  'Latin music clubs Italy',
  'soirée salsa Paris France',
  'Latin party Berlin Germany',
  'festival musica cubana Europa',
  'promotores eventos latinos Holanda',
  'club latino Zürich Switzerland',
]

const newCount = computed(() =>
  contacts.value.filter((c) => c.dedup.status === 'new' && !c._added).length
)

async function handleSearch() {
  if (!query.value.trim()) return
  await search(query.value)
}

async function handleAdd(contact: SearchContact) {
  contact._adding = true
  try {
    await addContact(contact, query.value)
    contact._added = true
    contact.dedup.status = 'exact_match'
    toast.add({ severity: 'success', summary: `Added ${contact.name}`, life: 3000 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Failed to add contact', life: 3000 })
  } finally {
    contact._adding = false
  }
}

async function handleAddAll() {
  addingAll.value = true
  try {
    const res = await addAllNew(query.value)
    // Mark all new as added
    contacts.value.forEach((c) => {
      if (c.dedup.status === 'new') {
        c._added = true
        c.dedup.status = 'exact_match'
      }
    })
    toast.add({
      severity: 'success',
      summary: `Added ${res.inserted} contacts`,
      life: 3000,
    })
  } catch {
    toast.add({ severity: 'error', summary: 'Failed to add contacts', life: 3000 })
  } finally {
    addingAll.value = false
  }
}
</script>
