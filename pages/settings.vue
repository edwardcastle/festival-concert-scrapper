<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-6">Settings</h1>

    <div class="max-w-2xl space-y-6">
      <!-- AI Mode -->
      <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
        <h2 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          AI Integration
        </h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-white">Claude AI Extraction</span>
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full"
                :class="status?.aiAvailable ? 'bg-green-400' : 'bg-yellow-400'"
              />
              <span class="text-sm" :class="status?.aiAvailable ? 'text-green-400' : 'text-yellow-400'">
                {{ status?.aiAvailable ? 'Active' : 'Not configured' }}
              </span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white">Serper.dev Search</span>
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full"
                :class="status?.serperAvailable ? 'bg-green-400' : 'bg-yellow-400'"
              />
              <span class="text-sm" :class="status?.serperAvailable ? 'text-green-400' : 'text-yellow-400'">
                {{ status?.serperAvailable ? 'Active' : 'Not configured' }}
              </span>
            </div>
          </div>
          <p class="text-xs text-[var(--color-text-muted)]">
            Set ANTHROPIC_API_KEY and SERPER_API_KEY in your .env file to enable AI features.
          </p>
        </div>
      </section>

      <!-- Database -->
      <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
        <h2 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          Database
        </h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-white">Contacts</span>
            <span class="text-sm text-[var(--color-electric-blue)]">
              {{ status?.contactCount || 0 }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white">Database Size</span>
            <span class="text-sm text-[var(--color-text-muted)]">
              {{ status?.dbSize || '0 KB' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Export -->
      <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
        <h2 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          Export
        </h2>
        <div class="flex gap-3">
          <Button
            label="Export All (CSV)"
            icon="pi pi-download"
            severity="info"
            size="small"
            @click="exportAll('csv')"
          />
          <Button
            label="Export All (XLSX)"
            icon="pi pi-download"
            severity="info"
            size="small"
            @click="exportAll('xlsx')"
          />
        </div>
      </section>

      <!-- Keyboard Shortcuts -->
      <section class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
        <h2 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          Keyboard Shortcuts
        </h2>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-white">Focus search</span>
            <kbd class="px-2 py-1 bg-[var(--color-navy-dark)] rounded text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
              Ctrl + K
            </kbd>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white">New contact</span>
            <kbd class="px-2 py-1 bg-[var(--color-navy-dark)] rounded text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
              Ctrl + N
            </kbd>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white">Close dialogs</span>
            <kbd class="px-2 py-1 bg-[var(--color-navy-dark)] rounded text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
              Esc
            </kbd>
          </div>
        </div>
      </section>

      <!-- Logout -->
      <section>
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          severity="danger"
          @click="handleLogout"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const { logout } = useAuth()

const status = ref<{
  aiAvailable: boolean
  serperAvailable: boolean
  dbSize: string
  contactCount: number
} | null>(null)

onMounted(async () => {
  try {
    status.value = await $fetch('/api/settings/status')
  } catch {}
})

async function exportAll(format: string) {
  try {
    const res = await $fetch('/api/contacts/export', {
      method: 'POST',
      body: { format },
      responseType: 'blob',
    })
    const ext = format === 'xlsx' ? 'xlsx' : 'csv'
    const url = URL.createObjectURL(res as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-all.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ severity: 'success', summary: 'Export downloaded', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Export failed', life: 3000 })
  }
}

function handleLogout() {
  logout()
}
</script>
