<template>
  <div class="space-y-3">
    <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
      Notes
    </h3>

    <!-- Add note form -->
    <div class="space-y-2">
      <Textarea
        v-model="newNote"
        placeholder="Add a note..."
        rows="2"
        class="w-full text-sm"
      />
      <div class="flex gap-2">
        <Select
          v-model="noteType"
          :options="noteTypeOptions"
          optionLabel="label"
          optionValue="value"
          class="flex-1"
          size="small"
        />
        <Button
          icon="pi pi-plus"
          label="Add"
          size="small"
          severity="info"
          :disabled="!newNote.trim()"
          @click="handleAddNote"
        />
      </div>
    </div>

    <!-- Notes list -->
    <div class="space-y-2 max-h-80 overflow-y-auto">
      <div
        v-for="note in notes"
        :key="note.id"
        class="group p-3 bg-[var(--color-navy-dark)] rounded-lg border border-[var(--color-border)]"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <Tag
                :value="formatNoteType(note.type)"
                severity="secondary"
                class="text-xs"
              />
              <span class="text-xs text-[var(--color-text-muted)]">
                {{ formatDate(note.created_at) }}
              </span>
            </div>
            <p class="text-sm text-white whitespace-pre-wrap">{{ note.content }}</p>
          </div>
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            size="small"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @click="$emit('delete', note.id)"
          />
        </div>
      </div>
    </div>

    <p v-if="notes.length === 0" class="text-sm text-[var(--color-text-muted)] text-center py-4">
      No notes yet
    </p>
  </div>
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Note, NoteType } from '~/types'

defineProps<{ notes: Note[] }>()
const emit = defineEmits<{
  add: [content: string, type: NoteType]
  delete: [id: number]
}>()

const newNote = ref('')
const noteType = ref<NoteType>('note')

const noteTypeOptions = [
  { label: 'Note', value: 'note' },
  { label: 'Email Sent', value: 'email_sent' },
  { label: 'Email Received', value: 'email_received' },
  { label: 'Call', value: 'call' },
  { label: 'Meeting', value: 'meeting' },
]

function handleAddNote() {
  if (!newNote.value.trim()) return
  emit('add', newNote.value, noteType.value)
  newNote.value = ''
}

function formatNoteType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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
