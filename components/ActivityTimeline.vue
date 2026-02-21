<template>
  <div class="space-y-3">
    <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
      Activity
    </h3>
    <Timeline :value="items" class="custom-timeline">
      <template #marker="{ item }">
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          :class="markerClass(item.type)"
        >
          <i :class="markerIcon(item.type)" />
        </span>
      </template>
      <template #content="{ item }">
        <div class="pb-3">
          <p class="text-sm text-white">{{ item.content }}</p>
          <p class="text-xs text-[var(--color-text-muted)] mt-1">
            {{ formatDate(item.created_at) }}
          </p>
        </div>
      </template>
    </Timeline>
    <p v-if="items.length === 0" class="text-sm text-[var(--color-text-muted)] text-center py-4">
      No activity yet
    </p>
  </div>
</template>

<script setup lang="ts">
import Timeline from 'primevue/timeline'
import type { Note } from '~/types'

defineProps<{ items: Note[] }>()

function markerClass(type: string) {
  const classes: Record<string, string> = {
    note: 'bg-blue-600',
    email_sent: 'bg-green-600',
    email_received: 'bg-emerald-600',
    call: 'bg-orange-600',
    meeting: 'bg-purple-600',
  }
  return classes[type] || 'bg-gray-600'
}

function markerIcon(type: string) {
  const icons: Record<string, string> = {
    note: 'pi pi-pencil',
    email_sent: 'pi pi-send',
    email_received: 'pi pi-envelope',
    call: 'pi pi-phone',
    meeting: 'pi pi-calendar',
  }
  return icons[type] || 'pi pi-circle'
}

function formatDate(date: string) {
  if (!date) return ''
  const d = new Date(date + 'Z')
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
