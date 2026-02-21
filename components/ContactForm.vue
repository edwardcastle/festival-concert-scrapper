<template>
  <div class="space-y-6">
    <!-- Identity Section -->
    <fieldset class="border border-[var(--color-border)] rounded-lg p-4">
      <legend class="text-sm font-semibold text-[var(--color-electric-blue)] px-2">
        Identity
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Name *</label>
          <InputText v-model="form.name" placeholder="Contact name" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Type</label>
          <Select
            v-model="form.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select type"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Email</label>
          <InputText v-model="form.email" placeholder="email@example.com" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Phone</label>
          <InputText v-model="form.phone" placeholder="+34..." class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Website</label>
          <InputText v-model="form.website" placeholder="https://..." class="w-full" />
        </div>
      </div>
    </fieldset>

    <!-- Social Section -->
    <fieldset class="border border-[var(--color-border)] rounded-lg p-4">
      <legend class="text-sm font-semibold text-[var(--color-electric-blue)] px-2">
        Social
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Instagram Handle</label>
          <InputText v-model="form.instagram_handle" placeholder="@handle" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Instagram URL</label>
          <InputText v-model="form.instagram_url" placeholder="https://instagram.com/..." class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Instagram Followers</label>
          <InputText v-model="form.instagram_followers" placeholder="17K" class="w-full" />
        </div>
      </div>
    </fieldset>

    <!-- Location Section -->
    <fieldset class="border border-[var(--color-border)] rounded-lg p-4">
      <legend class="text-sm font-semibold text-[var(--color-electric-blue)] px-2">
        Location
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">City</label>
          <InputText v-model="form.city" placeholder="City" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Country</label>
          <InputText v-model="form.country" placeholder="Country" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Region</label>
          <InputText v-model="form.region" placeholder="Region" class="w-full" />
        </div>
      </div>
    </fieldset>

    <!-- Event Info Section -->
    <fieldset class="border border-[var(--color-border)] rounded-lg p-4">
      <legend class="text-sm font-semibold text-[var(--color-electric-blue)] px-2">
        Event Info
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Event Type</label>
          <InputText v-model="form.event_type" placeholder="Festival, Club Night..." class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Capacity</label>
          <InputText v-model="form.capacity" placeholder="500" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Genres (comma-separated)</label>
          <InputText v-model="form.genres" placeholder="reggaeton, salsa, timba" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Dates 2026</label>
          <InputText v-model="form.dates_2026" placeholder="June 15-17, 2026" class="w-full" />
        </div>
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-xs text-[var(--color-text-muted)]">Lineup Artists</label>
          <InputText v-model="form.lineup_artists" placeholder="Artist 1, Artist 2" class="w-full" />
        </div>
      </div>
    </fieldset>

    <!-- Cuban Connection Section -->
    <fieldset
      class="border rounded-lg p-4"
      :class="
        form.cuban_connection
          ? 'border-[var(--color-gold)]'
          : 'border-[var(--color-border)]'
      "
    >
      <legend class="text-sm font-semibold text-[var(--color-gold)] px-2">
        Cuban Connection
      </legend>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-[var(--color-text-muted)]">Connection Notes</label>
        <Textarea
          v-model="form.cuban_connection"
          placeholder="Describe the Cuban music connection..."
          rows="2"
          class="w-full"
        />
      </div>
    </fieldset>

    <!-- CRM Section -->
    <fieldset class="border border-[var(--color-border)] rounded-lg p-4">
      <legend class="text-sm font-semibold text-[var(--color-electric-blue)] px-2">
        CRM
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Status</label>
          <Select
            v-model="form.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Priority</label>
          <Select
            v-model="form.priority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Tags (comma-separated)</label>
          <InputText v-model="form.tags" placeholder="latin, europe" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Source</label>
          <InputText v-model="form.source" placeholder="Google search, Instagram" class="w-full" />
        </div>
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-xs text-[var(--color-text-muted)]">Admin Notes</label>
          <Textarea v-model="form.admin_notes" rows="2" class="w-full" />
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import type { Contact } from '~/types'

const props = defineProps<{
  modelValue: Partial<Contact>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Partial<Contact>]
}>()

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

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
</script>
