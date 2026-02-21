<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-6">Import Contacts</h1>

    <!-- Step indicators -->
    <div class="flex items-center gap-4 mb-8">
      <div
        v-for="(s, i) in steps"
        :key="i"
        class="flex items-center gap-2"
      >
        <span
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          :class="
            step > i
              ? 'bg-[var(--color-green)] text-white'
              : step === i
                ? 'bg-[var(--color-electric-blue)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
          "
        >
          <i v-if="step > i" class="pi pi-check text-xs" />
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span
          class="text-sm hidden md:inline"
          :class="step === i ? 'text-white' : 'text-[var(--color-text-muted)]'"
        >
          {{ s }}
        </span>
        <i v-if="i < 2" class="pi pi-chevron-right text-xs text-[var(--color-text-muted)] hidden md:inline" />
      </div>
    </div>

    <!-- Step 1: Upload -->
    <div v-if="step === 0" class="max-w-xl mx-auto">
      <div
        class="border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer"
        :class="
          dragOver
            ? 'border-[var(--color-electric-blue)] bg-[var(--color-electric-blue)]/10'
            : 'border-[var(--color-border)] hover:border-[var(--color-electric-blue)]'
        "
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <i class="pi pi-upload text-4xl text-[var(--color-text-muted)] mb-4" />
        <p class="text-white font-medium mb-2">
          Drop your file here or click to browse
        </p>
        <p class="text-sm text-[var(--color-text-muted)]">
          Supports .xlsx and .csv files
        </p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.csv"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- Step 2: Map Columns -->
    <div v-if="step === 1">
      <ImportMapper
        :headers="parsedHeaders"
        v-model="columnMapping"
      />
      <div class="flex justify-between mt-6">
        <Button label="Back" severity="secondary" @click="step = 0" />
        <Button
          label="Preview"
          severity="info"
          @click="previewImport"
          :disabled="!columnMapping.name && !Object.values(columnMapping).includes('name')"
        />
      </div>
    </div>

    <!-- Step 3: Preview & Confirm -->
    <div v-if="step === 2">
      <div class="mb-4 flex items-center gap-4">
        <span class="text-sm text-[var(--color-text-muted)]">
          {{ previewRows.length }} rows to import
        </span>
        <div class="flex gap-2">
          <Tag value="New" severity="success" />
          <span class="text-xs text-[var(--color-text-muted)]">{{ dedupStats.new }}</span>
          <Tag value="Duplicate" severity="warn" />
          <span class="text-xs text-[var(--color-text-muted)]">{{ dedupStats.possible }}</span>
          <Tag value="Exists" severity="secondary" />
          <span class="text-xs text-[var(--color-text-muted)]">{{ dedupStats.exact }}</span>
        </div>
      </div>

      <DataTable
        v-model:selection="selectedRows"
        :value="previewRows"
        dataKey="_rowIndex"
        :paginator="previewRows.length > 20"
        :rows="20"
        scrollable
        scrollHeight="400px"
        class="rounded-lg overflow-hidden border border-[var(--color-border)] mb-6"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem" />
        <Column header="Status" style="width: 100px">
          <template #body="{ data }">
            <Tag
              :value="data._dedupLabel"
              :severity="data._dedupSeverity"
              class="text-xs"
            />
          </template>
        </Column>
        <Column
          v-for="field in mappedFields"
          :key="field"
          :field="field"
          :header="field"
          style="min-width: 120px"
        />
      </DataTable>

      <div class="flex justify-between">
        <Button label="Back" severity="secondary" @click="step = 1" />
        <Button
          :label="`Import ${selectedRows.length} contacts`"
          severity="info"
          :loading="importing"
          :disabled="selectedRows.length === 0"
          @click="executeImport"
        />
      </div>
    </div>

    <!-- Results -->
    <div v-if="step === 3" class="max-w-md mx-auto text-center py-12">
      <i class="pi pi-check-circle text-5xl text-[var(--color-green)] mb-4" />
      <h2 class="text-xl font-bold text-white mb-2">Import Complete</h2>
      <div class="space-y-1 text-sm text-[var(--color-text-muted)]">
        <p>Inserted: <span class="text-[var(--color-green)]">{{ importResult.inserted }}</span></p>
        <p>Duplicates: <span class="text-[var(--color-gold)]">{{ importResult.duplicates }}</span></p>
        <p>Skipped: <span class="text-[var(--color-text-muted)]">{{ importResult.skipped }}</span></p>
      </div>
      <div class="flex gap-3 justify-center mt-6">
        <Button label="Import More" severity="secondary" @click="resetImport" />
        <Button label="View Contacts" severity="info" @click="navigateTo('/')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const steps = ['Upload', 'Map Columns', 'Preview & Confirm']
const step = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const parsedHeaders = ref<string[]>([])
const parsedRows = ref<Record<string, any>[]>([])
const columnMapping = ref<Record<string, string>>({})

const previewRows = ref<any[]>([])
const selectedRows = ref<any[]>([])
const mappedFields = ref<string[]>([])
const importing = ref(false)
const importResult = ref({ inserted: 0, duplicates: 0, skipped: 0 })
const dedupStats = ref({ new: 0, possible: 0, exact: 0 })

async function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) await uploadFile(file)
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await uploadFile(file)
}

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await $fetch<{
      headers: string[]
      rows: Record<string, any>[]
      totalRows: number
      mapping: Record<string, string>
    }>('/api/import/parse', {
      method: 'POST',
      body: formData,
    })

    parsedHeaders.value = res.headers
    parsedRows.value = res.rows
    columnMapping.value = res.mapping
    step.value = 1

    toast.add({
      severity: 'success',
      summary: `Parsed ${res.totalRows} rows`,
      life: 3000,
    })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: e.data?.message || 'Failed to parse file',
      life: 5000,
    })
  }
}

function previewImport() {
  // Find which fields are mapped
  const reverseMap: Record<string, string> = {}
  for (const [source, target] of Object.entries(columnMapping.value)) {
    if (target) reverseMap[target] = source
  }

  mappedFields.value = Object.keys(reverseMap)

  previewRows.value = parsedRows.value.map((row, idx) => {
    const mapped: Record<string, any> = { _rowIndex: idx }
    for (const [target, source] of Object.entries(reverseMap)) {
      mapped[target] = row[source] || ''
    }
    // Placeholder dedup
    mapped._dedupLabel = 'New'
    mapped._dedupSeverity = 'success'
    return mapped
  })

  selectedRows.value = [...previewRows.value]
  dedupStats.value = {
    new: previewRows.value.length,
    possible: 0,
    exact: 0,
  }
  step.value = 2
}

async function executeImport() {
  importing.value = true
  try {
    // Remap selected rows to source columns for server
    const reverseMap: Record<string, string> = {}
    for (const [source, target] of Object.entries(columnMapping.value)) {
      if (target) reverseMap[target] = source
    }

    // Send original rows with mapping
    const rowIndices = new Set(selectedRows.value.map((r) => r._rowIndex))
    const rowsToImport = parsedRows.value.filter((_, i) => rowIndices.has(i))

    const res = await $fetch<{
      inserted: number
      duplicates: number
      skipped: number
    }>('/api/import/execute', {
      method: 'POST',
      body: { rows: rowsToImport, mapping: columnMapping.value },
    })

    importResult.value = res
    step.value = 3

    toast.add({
      severity: 'success',
      summary: `Imported ${res.inserted} contacts`,
      life: 5000,
    })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: e.data?.message || 'Import failed',
      life: 5000,
    })
  } finally {
    importing.value = false
  }
}

function resetImport() {
  step.value = 0
  parsedHeaders.value = []
  parsedRows.value = []
  columnMapping.value = {}
  previewRows.value = []
  selectedRows.value = []
  importResult.value = { inserted: 0, duplicates: 0, skipped: 0 }
}
</script>
