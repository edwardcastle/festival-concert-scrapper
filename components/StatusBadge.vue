<template>
  <Tag :value="label" :severity="severity" :class="className" />
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import type { ContactStatus } from '~/types'

const props = defineProps<{ status: ContactStatus }>()

const statusConfig: Record<
  ContactStatus,
  { label: string; severity: string; className: string }
> = {
  new: { label: 'New', severity: 'info', className: '' },
  researched: { label: 'Researched', severity: 'info', className: 'bg-purple-600!' },
  contacted: { label: 'Contacted', severity: 'info', className: 'bg-blue-600!' },
  responded: { label: 'Responded', severity: 'success', className: '' },
  negotiating: { label: 'Negotiating', severity: 'warn', className: '' },
  booked: {
    label: 'Booked',
    severity: 'success',
    className: 'bg-[var(--color-gold)]! text-black!',
  },
  rejected: { label: 'Rejected', severity: 'danger', className: '' },
  inactive: { label: 'Inactive', severity: 'secondary', className: '' },
}

const config = computed(() => statusConfig[props.status] || statusConfig.new)
const label = computed(() => config.value.label)
const severity = computed(() => config.value.severity as any)
const className = computed(() => config.value.className)
</script>
