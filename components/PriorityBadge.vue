<template>
  <Tag :value="label" :severity="severity" v-if="priority > 0" />
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import type { Priority } from '~/types'

const props = defineProps<{ priority: Priority }>()

const label = computed(() => {
  if (props.priority === 2) return 'Urgent'
  if (props.priority === 1) return 'High'
  return ''
})

const severity = computed(() => {
  if (props.priority === 2) return 'danger'
  if (props.priority === 1) return 'warn'
  return 'info'
})
</script>
