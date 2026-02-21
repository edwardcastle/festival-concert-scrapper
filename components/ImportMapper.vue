<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
      Map Columns
    </h3>
    <p class="text-sm text-[var(--color-text-muted)]">
      Match your file columns to contact fields. Auto-mapped columns are highlighted.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div
        v-for="header in headers"
        :key="header"
        class="flex items-center gap-3 p-3 rounded-lg border"
        :class="
          mapping[header]
            ? 'border-[var(--color-electric-blue)]/40 bg-[var(--color-electric-blue)]/5'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]'
        "
      >
        <span class="text-sm text-white flex-1 truncate" :title="header">
          {{ header }}
        </span>
        <i class="pi pi-arrow-right text-[var(--color-text-muted)] text-xs" />
        <Select
          v-model="mapping[header]"
          :options="fieldOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Skip"
          showClear
          class="w-44"
          size="small"
          @change="$emit('update:modelValue', mapping)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Select from 'primevue/select'

const props = defineProps<{
  headers: string[]
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const mapping = reactive<Record<string, string>>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(mapping, val)
  },
  { deep: true }
)

const fieldOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Type', value: 'type' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Website', value: 'website' },
  { label: 'Instagram Handle', value: 'instagram_handle' },
  { label: 'Instagram URL', value: 'instagram_url' },
  { label: 'Instagram Followers', value: 'instagram_followers' },
  { label: 'City', value: 'city' },
  { label: 'Country', value: 'country' },
  { label: 'Region', value: 'region' },
  { label: 'Event Type', value: 'event_type' },
  { label: 'Genres', value: 'genres' },
  { label: 'Capacity', value: 'capacity' },
  { label: 'Dates 2026', value: 'dates_2026' },
  { label: 'Lineup Artists', value: 'lineup_artists' },
  { label: 'Cuban Connection', value: 'cuban_connection' },
  { label: 'Status', value: 'status' },
  { label: 'Priority', value: 'priority' },
  { label: 'Tags', value: 'tags' },
  { label: 'Source', value: 'source' },
  { label: 'Admin Notes', value: 'admin_notes' },
]
</script>
