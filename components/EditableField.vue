<template>
  <div class="flex flex-col gap-1">
    <label class="text-xs text-[var(--color-text-muted)]">{{ label }}</label>
    <InputText
      :modelValue="modelValue || ''"
      @update:modelValue="$emit('update:modelValue', $event)"
      @blur="$emit('save', modelValue)"
      class="w-full"
      :placeholder="label"
    />
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'

defineProps<{
  label: string
  modelValue: string | null | undefined
}>()

defineEmits<{
  'update:modelValue': [value: string]
  save: [value: string | null | undefined]
}>()
</script>
