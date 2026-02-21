<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Status Pie Chart -->
    <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
      <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
        By Status
      </h3>
      <Chart type="pie" :data="statusChartData" :options="pieOptions" class="h-64" />
    </div>

    <!-- Country Bar Chart -->
    <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
      <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
        By Country (Top 15)
      </h3>
      <Chart type="bar" :data="countryChartData" :options="barOptions" class="h-64" />
    </div>

    <!-- Type Donut Chart -->
    <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
      <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
        By Type
      </h3>
      <Chart type="doughnut" :data="typeChartData" :options="pieOptions" class="h-64" />
    </div>

    <!-- Over Time Line Chart -->
    <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
      <h3 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
        Added Over Time (30 Days)
      </h3>
      <Chart type="line" :data="overTimeChartData" :options="lineOptions" class="h-64" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Chart from 'primevue/chart'

const props = defineProps<{
  byStatus: { status: string; count: number }[]
  byCountry: { country: string; count: number }[]
  byType: { type: string; count: number }[]
  overTime: { date: string; count: number }[]
}>()

const statusColors: Record<string, string> = {
  new: '#3b82f6',
  researched: '#8b5cf6',
  contacted: '#0ea5e9',
  responded: '#10b981',
  negotiating: '#f59e0b',
  booked: '#f59e0b',
  rejected: '#ef4444',
  inactive: '#6b7280',
}

const statusChartData = computed(() => ({
  labels: props.byStatus.map((s) => s.status),
  datasets: [
    {
      data: props.byStatus.map((s) => s.count),
      backgroundColor: props.byStatus.map(
        (s) => statusColors[s.status] || '#6b7280'
      ),
    },
  ],
}))

const countryChartData = computed(() => ({
  labels: props.byCountry.map((c) => c.country),
  datasets: [
    {
      label: 'Contacts',
      data: props.byCountry.map((c) => c.count),
      backgroundColor: '#0ea5e9',
      borderRadius: 4,
    },
  ],
}))

const typeChartData = computed(() => ({
  labels: props.byType.map((t) => t.type),
  datasets: [
    {
      data: props.byType.map((t) => t.count),
      backgroundColor: [
        '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316',
      ],
    },
  ],
}))

const overTimeChartData = computed(() => ({
  labels: props.overTime.map((d) =>
    new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  ),
  datasets: [
    {
      label: 'Added',
      data: props.overTime.map((d) => d.count),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      fill: true,
      tension: 0.3,
    },
  ],
}))

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#94a3b8', font: { size: 11 } },
    },
  },
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(46, 46, 78, 0.5)' },
    },
    y: {
      ticks: { color: '#94a3b8', font: { size: 10 } },
      grid: { display: false },
    },
  },
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8', font: { size: 10 } },
      grid: { color: 'rgba(46, 46, 78, 0.5)' },
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#94a3b8', stepSize: 1 },
      grid: { color: 'rgba(46, 46, 78, 0.5)' },
    },
  },
}
</script>
