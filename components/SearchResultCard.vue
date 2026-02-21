<template>
  <div
    class="border rounded-lg p-4 bg-[var(--color-surface)] hover:border-[var(--color-electric-blue)]/40 transition-colors"
    :class="{
      'border-[var(--color-gold)]/50': contact.cuban_connection,
      'border-[var(--color-border)]': !contact.cuban_connection,
    }"
  >
    <!-- Header: Name + Type + Dedup badge + Actions -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-semibold text-white text-base">
            {{ contact.name }}
          </span>
          <Tag
            v-if="contact.type"
            :value="contact.type"
            severity="info"
            class="text-xs capitalize"
          />
          <Tag
            :value="dedupLabel"
            :severity="dedupSeverity"
            class="text-xs"
          />
          <i
            v-if="contact.cuban_connection"
            class="pi pi-star-fill text-[var(--color-gold)]"
            v-tooltip="contact.cuban_connection"
          />
        </div>
      </div>

      <div class="flex gap-2 shrink-0">
        <NuxtLink
          v-if="contact.dedup.status !== 'new' && contact.dedup.existingId"
          :to="`/contacts/${contact.dedup.existingId}`"
        >
          <Button label="View" severity="secondary" size="small" />
        </NuxtLink>
        <Button
          v-if="contact.dedup.status !== 'exact_match' && !contact._added"
          label="Add"
          icon="pi pi-plus"
          severity="info"
          size="small"
          :loading="contact._adding"
          @click="$emit('add')"
        />
        <Tag
          v-if="contact._added"
          value="Added"
          severity="success"
          class="text-xs"
        />
      </div>
    </div>

    <!-- Contact details grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
      <!-- Instagram -->
      <div v-if="contact.instagram_handle" class="flex items-center gap-2">
        <i class="pi pi-instagram text-[var(--color-electric-blue)]" />
        <a
          :href="contact.instagram_url || `https://www.instagram.com/${contact.instagram_handle}/`"
          target="_blank"
          class="text-[var(--color-electric-blue)] hover:underline"
        >
          @{{ contact.instagram_handle }}
        </a>
        <span v-if="contact.instagram_followers" class="text-[var(--color-text-muted)] text-xs">
          ({{ contact.instagram_followers }} followers)
        </span>
      </div>

      <!-- Location -->
      <div v-if="contact.city || contact.country" class="flex items-center gap-2 text-[var(--color-text-muted)]">
        <i class="pi pi-map-marker" />
        <span>{{ [contact.city, contact.country].filter(Boolean).join(', ') }}</span>
      </div>

      <!-- Email -->
      <div v-if="contact.email" class="flex items-center gap-2">
        <i class="pi pi-envelope text-[var(--color-text-muted)]" />
        <a :href="`mailto:${contact.email}`" class="text-[var(--color-electric-blue)] hover:underline">
          {{ contact.email }}
        </a>
      </div>

      <!-- Phone -->
      <div v-if="contact.phone" class="flex items-center gap-2 text-[var(--color-text-muted)]">
        <i class="pi pi-phone" />
        <span>{{ contact.phone }}</span>
      </div>

      <!-- Website -->
      <div v-if="contact.website && !contact.website.includes('instagram.com')" class="flex items-center gap-2">
        <i class="pi pi-globe text-[var(--color-text-muted)]" />
        <a :href="contact.website" target="_blank" class="text-[var(--color-electric-blue)] hover:underline truncate max-w-64">
          {{ contact.website.replace(/^https?:\/\/(www\.)?/, '') }}
        </a>
      </div>

      <!-- Genres -->
      <div v-if="contact.genres" class="flex items-center gap-2 text-[var(--color-text-muted)]">
        <i class="pi pi-volume-up" />
        <span class="truncate">{{ contact.genres }}</span>
      </div>

      <!-- Event type -->
      <div v-if="contact.event_type" class="flex items-center gap-2 text-[var(--color-text-muted)]">
        <i class="pi pi-calendar" />
        <span class="capitalize">{{ contact.event_type }}</span>
      </div>
    </div>

    <!-- Cuban connection -->
    <div
      v-if="contact.cuban_connection"
      class="mt-2 px-3 py-1.5 rounded bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 text-sm text-[var(--color-gold)]"
    >
      <i class="pi pi-star-fill mr-1" /> {{ contact.cuban_connection }}
    </div>

    <!-- Notes -->
    <p v-if="contact.notes" class="mt-2 text-xs text-[var(--color-text-muted)] line-clamp-2">
      {{ contact.notes }}
    </p>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { SearchContact, DedupResult } from '~/types'

const props = defineProps<{ contact: SearchContact }>()

defineEmits<{ add: [] }>()

const dedupLabel = computed(() => {
  const s = props.contact.dedup.status
  if (s === 'exact_match') return 'Exists'
  if (s === 'possible_duplicate') return 'Possible Dupe'
  return 'New'
})

const dedupSeverity = computed(() => {
  const s = props.contact.dedup.status
  if (s === 'exact_match') return 'secondary'
  if (s === 'possible_duplicate') return 'warn'
  return 'success'
})
</script>
