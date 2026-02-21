<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-6">Statistics</h1>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <ProgressSpinner />
    </div>

    <template v-if="stats">
      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <div class="text-sm text-[var(--color-text-muted)]">Total Contacts</div>
          <div class="text-3xl font-bold text-white mt-1">{{ stats.total }}</div>
        </div>
        <div class="bg-[var(--color-surface)] border border-[var(--color-gold)]/30 rounded-lg p-5">
          <div class="text-sm text-[var(--color-gold)]">Cuban Connections</div>
          <div class="text-3xl font-bold text-[var(--color-gold)] mt-1">
            {{ stats.cubanCount }}
            <span class="text-sm font-normal text-[var(--color-text-muted)]">
              ({{ stats.cubanPercentage }}%)
            </span>
          </div>
        </div>
        <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <div class="text-sm text-[var(--color-text-muted)]">This Month</div>
          <div class="text-3xl font-bold text-[var(--color-green)] mt-1">
            {{ stats.thisMonthCount }}
          </div>
        </div>
        <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
          <div class="text-sm text-[var(--color-text-muted)]">Total Searches</div>
          <div class="text-3xl font-bold text-[var(--color-electric-blue)] mt-1">
            {{ stats.totalSearches }}
          </div>
        </div>
      </div>

      <!-- Charts -->
      <StatsCharts
        :by-status="stats.byStatus"
        :by-country="stats.byCountry"
        :by-type="stats.byType"
        :over-time="stats.overTime"
      />

      <!-- Search History -->
      <div class="mt-8">
        <h2 class="text-lg font-bold text-white mb-4">Search History</h2>
        <DataTable
          :value="stats.recentSearches"
          :paginator="false"
          class="rounded-lg overflow-hidden border border-[var(--color-border)]"
        >
          <template #empty>
            <div class="text-center py-8 text-[var(--color-text-muted)]">
              No searches yet
            </div>
          </template>
          <Column field="query" header="Query" />
          <Column field="results_count" header="Results" style="width: 100px" />
          <Column field="new_contacts" header="New" style="width: 80px">
            <template #body="{ data }">
              <span class="text-[var(--color-green)]">{{ data.new_contacts }}</span>
            </template>
          </Column>
          <Column field="created_at" header="Date" style="width: 140px">
            <template #body="{ data }">
              <span class="text-xs text-[var(--color-text-muted)]">
                {{ formatDate(data.created_at) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'

const loading = ref(true)
const stats = ref<any>(null)

onMounted(async () => {
  try {
    stats.value = await $fetch('/api/stats')
  } catch (e) {
    console.error('Failed to load stats:', e)
  } finally {
    loading.value = false
  }
})

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
