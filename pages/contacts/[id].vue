<template>
  <div v-if="contact">
    <!-- Header -->
    <div class="flex items-start gap-3 mb-6">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        size="small"
        @click="navigateTo('/')"
        class="shrink-0 mt-1"
      />
      <div class="min-w-0">
        <h1 class="text-lg md:text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
          <span class="truncate">{{ contact.name }}</span>
          <i
            v-if="contact.cuban_connection"
            class="pi pi-star-fill text-[var(--color-gold)] text-sm md:text-lg"
          />
        </h1>
        <div class="flex items-center gap-2 mt-1 flex-wrap">
          <StatusBadge :status="contact.status" />
          <PriorityBadge :priority="contact.priority" />
          <span v-if="contact.type" class="text-sm text-[var(--color-text-muted)] capitalize">
            {{ contact.type }}
          </span>
        </div>
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Form (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Identity -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <h2 class="text-sm font-semibold text-[var(--color-electric-blue)] mb-4 uppercase tracking-wider">
            Identity
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField label="Name" v-model="contact.name" @save="saveField('name', $event)" />
            <div class="flex flex-col gap-1">
              <label class="text-xs text-[var(--color-text-muted)]">Type</label>
              <Select
                v-model="contact.type"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                @change="saveField('type', contact.type)"
              />
            </div>
            <EditableField label="Email" v-model="contact.email" @save="saveField('email', $event)" />
            <EditableField label="Phone" v-model="contact.phone" @save="saveField('phone', $event)" />
            <EditableField label="Website" v-model="contact.website" @save="saveField('website', $event)" class="md:col-span-2" />
          </div>
        </section>

        <!-- Social -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <h2 class="text-sm font-semibold text-[var(--color-electric-blue)] mb-4 uppercase tracking-wider">
            Social
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField label="Instagram Handle" v-model="contact.instagram_handle" @save="saveField('instagram_handle', $event)" />
            <EditableField label="Instagram URL" v-model="contact.instagram_url" @save="saveField('instagram_url', $event)" />
            <EditableField label="Instagram Followers" v-model="contact.instagram_followers" @save="saveField('instagram_followers', $event)" />
          </div>
        </section>

        <!-- Location -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <h2 class="text-sm font-semibold text-[var(--color-electric-blue)] mb-4 uppercase tracking-wider">
            Location
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EditableField label="City" v-model="contact.city" @save="saveField('city', $event)" />
            <EditableField label="Country" v-model="contact.country" @save="saveField('country', $event)" />
            <EditableField label="Region" v-model="contact.region" @save="saveField('region', $event)" />
          </div>
        </section>

        <!-- Event Info -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <h2 class="text-sm font-semibold text-[var(--color-electric-blue)] mb-4 uppercase tracking-wider">
            Event Info
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField label="Event Type" v-model="contact.event_type" @save="saveField('event_type', $event)" />
            <EditableField label="Capacity" v-model="contact.capacity" @save="saveField('capacity', $event)" />
            <EditableField label="Genres" v-model="contact.genres" @save="saveField('genres', $event)" />
            <EditableField label="Dates 2026" v-model="contact.dates_2026" @save="saveField('dates_2026', $event)" />
            <EditableField label="Lineup Artists" v-model="contact.lineup_artists" @save="saveField('lineup_artists', $event)" class="md:col-span-2" />
          </div>
        </section>

        <!-- Cuban Connection -->
        <section
          class="border rounded-lg p-5"
          :class="contact.cuban_connection ? 'bg-[var(--color-gold)]/5 border-[var(--color-gold)]' : 'bg-[var(--color-surface)] border-[var(--color-border)]'"
        >
          <h2 class="text-sm font-semibold text-[var(--color-gold)] mb-4 uppercase tracking-wider">
            Cuban Connection
          </h2>
          <div class="flex flex-col gap-1">
            <Textarea
              v-model="contact.cuban_connection"
              placeholder="Describe the Cuban music connection..."
              rows="2"
              class="w-full"
              @blur="saveField('cuban_connection', contact.cuban_connection)"
            />
          </div>
        </section>

        <!-- CRM -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <h2 class="text-sm font-semibold text-[var(--color-electric-blue)] mb-4 uppercase tracking-wider">
            CRM
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-[var(--color-text-muted)]">Status</label>
              <Select
                v-model="contact.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                @change="saveField('status', contact.status)"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-[var(--color-text-muted)]">Priority</label>
              <Select
                v-model="contact.priority"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                @change="saveField('priority', contact.priority)"
              />
            </div>
            <EditableField label="Tags" v-model="contact.tags" @save="saveField('tags', $event)" />
            <EditableField label="Source" v-model="contact.source" @save="saveField('source', $event)" />
            <EditableField label="Contacted Date" v-model="contact.contacted_date" @save="saveField('contacted_date', $event)" />
            <EditableField label="Contacted Via" v-model="contact.contacted_via" @save="saveField('contacted_via', $event)" />
            <div class="flex flex-col gap-1 md:col-span-2">
              <label class="text-xs text-[var(--color-text-muted)]">Admin Notes</label>
              <Textarea
                v-model="contact.admin_notes"
                rows="2"
                class="w-full"
                @blur="saveField('admin_notes', contact.admin_notes)"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- Right: Sidebar (1/3) -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div class="space-y-2">
            <Button
              label="Mark as Contacted"
              icon="pi pi-send"
              severity="info"
              size="small"
              class="w-full justify-start"
              @click="markContacted"
            />
            <Button
              label="Mark as Responded"
              icon="pi pi-check"
              severity="success"
              size="small"
              class="w-full justify-start"
              @click="saveField('status', 'responded')"
            />
            <Button
              v-if="contact.instagram_handle"
              label="Open Instagram"
              icon="pi pi-external-link"
              severity="secondary"
              size="small"
              class="w-full justify-start"
              @click="openInstagram"
            />
            <Button
              v-if="contact.email"
              label="Send Email"
              icon="pi pi-envelope"
              severity="secondary"
              size="small"
              class="w-full justify-start"
              @click="sendEmail"
            />
            <Button
              label="Enrich"
              icon="pi pi-sparkles"
              severity="warn"
              size="small"
              class="w-full justify-start"
              :loading="enriching"
              @click="enrichContact"
            />
          </div>
        </section>

        <!-- Notes -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <NotesSection
            :notes="contactNotes"
            @add="handleAddNote"
            @delete="handleDeleteNote"
          />
        </section>

        <!-- Activity Timeline -->
        <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <ActivityTimeline :items="contactNotes" />
        </section>

        <!-- Similar Contacts -->
        <section
          v-if="similarContacts.length > 0"
          class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5"
        >
          <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Similar Contacts
          </h3>
          <div class="space-y-2">
            <NuxtLink
              v-for="sc in similarContacts"
              :key="sc.id"
              :to="`/contacts/${sc.id}`"
              class="block p-2 rounded hover:bg-[var(--color-surface-hover)] text-sm"
            >
              <span class="text-[var(--color-electric-blue)]">{{ sc.name }}</span>
              <span class="text-[var(--color-text-muted)] text-xs ml-2">
                {{ sc.city }}, {{ sc.country }}
              </span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center py-20">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import type { Contact, Note, NoteType } from '~/types'

const route = useRoute()
const toast = useToast()

const contact = ref<(Contact & { notes: Note[] }) | null>(null)
const contactNotes = ref<Note[]>([])
const similarContacts = ref<Contact[]>([])
const enriching = ref(false)

let saveTimeout: ReturnType<typeof setTimeout> | null = null

const typeOptions = [
  { label: 'Promoter', value: 'promoter' },
  { label: 'Festival', value: 'festival' },
  { label: 'Venue', value: 'venue' },
  { label: 'Club', value: 'club' },
  { label: 'Media', value: 'media' },
  { label: 'Agency', value: 'agency' },
]

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

const priorityOptions = [
  { label: 'Normal', value: 0 },
  { label: 'High', value: 1 },
  { label: 'Urgent', value: 2 },
]

async function fetchContact() {
  try {
    const data = await $fetch<Contact & { notes: Note[] }>(
      `/api/contacts/${route.params.id}`
    )
    contact.value = data
    contactNotes.value = data.notes || []
    fetchSimilar()
  } catch {
    toast.add({ severity: 'error', summary: 'Contact not found', life: 3000 })
    navigateTo('/')
  }
}

async function fetchSimilar() {
  if (!contact.value?.country) return
  try {
    const res = await $fetch<{ data: Contact[] }>('/api/contacts', {
      params: {
        country: contact.value.country,
        limit: 5,
      },
    })
    similarContacts.value = res.data.filter(
      (c) => c.id !== contact.value!.id
    )
  } catch {}
}

function saveField(field: string, value: any) {
  if (!contact.value) return
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      await $fetch(`/api/contacts/${contact.value!.id}`, {
        method: 'PUT',
        body: { [field]: value },
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: `Failed to save ${field}`,
        life: 3000,
      })
    }
  }, 500)
}

function markContacted() {
  if (!contact.value) return
  contact.value.status = 'contacted'
  contact.value.contacted_date = new Date().toISOString().slice(0, 10)
  saveField('status', 'contacted')
  saveField('contacted_date', contact.value.contacted_date)
}

function openInstagram() {
  if (contact.value?.instagram_handle) {
    window.open(
      `https://instagram.com/${contact.value.instagram_handle}`,
      '_blank'
    )
  }
}

function sendEmail() {
  if (contact.value?.email) {
    window.open(`mailto:${contact.value.email}`)
  }
}

async function enrichContact() {
  if (!contact.value) return
  enriching.value = true
  try {
    const res = await $fetch<Contact>('/api/search/enrich', {
      method: 'POST',
      body: { contactId: contact.value.id },
    })
    await fetchContact()
    toast.add({ severity: 'success', summary: 'Contact enriched', life: 3000 })
  } catch (e: any) {
    toast.add({
      severity: 'warn',
      summary: e.data?.message || 'Enrichment not available',
      life: 3000,
    })
  } finally {
    enriching.value = false
  }
}

async function handleAddNote(content: string, type: NoteType) {
  try {
    await $fetch('/api/notes', {
      method: 'POST',
      body: {
        contact_id: contact.value!.id,
        content,
        type,
      },
    })
    await fetchContact()
    toast.add({ severity: 'success', summary: 'Note added', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Failed to add note', life: 3000 })
  }
}

async function handleDeleteNote(id: number) {
  try {
    await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
    contactNotes.value = contactNotes.value.filter((n) => n.id !== id)
    toast.add({ severity: 'success', summary: 'Note deleted', life: 2000 })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Failed to delete note',
      life: 3000,
    })
  }
}

onMounted(fetchContact)
</script>
