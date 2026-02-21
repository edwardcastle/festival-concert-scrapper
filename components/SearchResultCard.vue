<template>
  <div
    class="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)] hover:border-[var(--color-electric-blue)]/40 transition-colors"
  >
    <!-- Source info -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex-1 min-w-0">
        <a
          :href="result.url"
          target="_blank"
          class="text-[var(--color-electric-blue)] hover:underline font-medium text-sm truncate block"
        >
          {{ result.title }}
        </a>
        <p class="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
          {{ result.snippet }}
        </p>
      </div>
      <Tag
        :value="result.extractionMode === 'ai' ? 'AI Extracted' : 'Auto-extracted'"
        :severity="result.extractionMode === 'ai' ? 'success' : 'warn'"
        class="text-xs shrink-0"
      />
    </div>

    <!-- Extracted contacts -->
    <div
      v-for="(contact, idx) in result.contacts"
      :key="idx"
      class="mt-3 pt-3 border-t border-[var(--color-border)]"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium text-white text-sm">
              {{ contact.data.name || 'Unknown' }}
            </span>
            <Tag
              :value="dedupLabel(contact.dedup.status)"
              :severity="dedupSeverity(contact.dedup.status)"
              class="text-xs"
            />
            <i
              v-if="contact.data.cuban_connection"
              class="pi pi-star-fill text-[var(--color-gold)] text-xs"
              v-tooltip="contact.data.cuban_connection"
            />
          </div>

          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
            <span v-if="contact.data.type" class="capitalize">
              <i class="pi pi-tag mr-1" />{{ contact.data.type }}
            </span>
            <span v-if="contact.data.country">
              <i class="pi pi-map-marker mr-1" />
              {{ contact.data.city ? contact.data.city + ', ' : '' }}{{ contact.data.country }}
            </span>
            <span v-if="contact.data.instagram_handle">
              <i class="pi pi-at mr-1" />{{ contact.data.instagram_handle }}
            </span>
            <span v-if="contact.data.email">
              <i class="pi pi-envelope mr-1" />{{ contact.data.email }}
            </span>
            <span v-if="contact.data.genres" class="max-w-48 truncate">
              <i class="pi pi-music mr-1" />{{ contact.data.genres }}
            </span>
          </div>
        </div>

        <div class="flex gap-2 shrink-0">
          <NuxtLink
            v-if="contact.dedup.status !== 'new' && contact.dedup.existingContact"
            :to="`/contacts/${contact.dedup.existingContact.id}`"
          >
            <Button
              label="View"
              severity="secondary"
              size="small"
            />
          </NuxtLink>
          <Button
            v-if="contact.dedup.status !== 'exact_match' && !contact._added"
            label="Add"
            severity="info"
            size="small"
            :loading="contact._adding"
            @click="$emit('add', contact, idx)"
          />
          <Tag
            v-if="contact._added"
            value="Added"
            severity="success"
            class="text-xs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { SearchResultWithDedup, DedupResult } from '~/types'

defineProps<{ result: SearchResultWithDedup & { contacts: any[] } }>()

defineEmits<{
  add: [contact: any, index: number]
}>()

function dedupLabel(status: DedupResult) {
  if (status === 'exact_match') return 'Exists'
  if (status === 'possible_duplicate') return 'Possible Duplicate'
  return 'New'
}

function dedupSeverity(status: DedupResult) {
  if (status === 'exact_match') return 'secondary'
  if (status === 'possible_duplicate') return 'warn'
  return 'success'
}
</script>
