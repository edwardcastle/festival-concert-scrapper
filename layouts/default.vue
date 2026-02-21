<template>
  <div class="flex min-h-screen bg-[var(--color-navy)]">
    <!-- Desktop Sidebar (hidden on mobile) -->
    <aside
      class="hidden md:flex sticky top-0 left-0 h-screen w-64 flex-col bg-[var(--color-navy-dark)] border-r border-[var(--color-border)]"
    >
      <!-- Logo -->
      <div class="p-5 border-b border-[var(--color-border)]">
        <NuxtLink to="/" class="text-xl font-bold flex items-center gap-1">
          <span class="text-[var(--color-gold)]">Latin</span>
          <span class="text-white">Connect</span>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          :class="[
            isActive(item.path)
              ? 'bg-[var(--color-electric-blue)]/20 text-[var(--color-electric-blue)]'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-white',
          ]"
        >
          <i :class="item.icon" class="text-base w-5 text-center" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-[var(--color-border)]">
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          :class="
            aiMode
              ? 'bg-green-900/30 text-green-400'
              : 'bg-yellow-900/30 text-yellow-400'
          "
        >
          <span class="w-2 h-2 rounded-full" :class="aiMode ? 'bg-green-400' : 'bg-yellow-400'" />
          {{ aiMode ? 'AI Mode' : 'Basic Mode' }}
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile top bar -->
      <header class="md:hidden flex items-center justify-center p-3 border-b border-[var(--color-border)] bg-[var(--color-navy-dark)]">
        <span class="text-lg font-bold">
          <span class="text-[var(--color-gold)]">Latin</span><span class="text-white">Connect</span>
        </span>
      </header>

      <!-- Page content — extra bottom padding on mobile for bottom nav -->
      <main class="flex-1 p-3 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
        <slot />
      </main>
    </div>

    <!-- Mobile bottom navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-navy-dark)] border-t border-[var(--color-border)] safe-area-bottom">
      <div class="flex items-stretch">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
          :class="[
            isActive(item.path)
              ? 'text-[var(--color-electric-blue)]'
              : 'text-[var(--color-text-muted)]',
          ]"
        >
          <i :class="item.icon" class="text-lg" />
          <span class="text-[10px] leading-tight">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const aiMode = ref(false)

onMounted(async () => {
  try {
    const res = await $fetch<{ aiAvailable: boolean }>('/api/settings/status')
    aiMode.value = res.aiAvailable
  } catch {}
})

const navItems = [
  { path: '/', label: 'Contacts', icon: 'pi pi-users' },
  { path: '/search', label: 'Search', icon: 'pi pi-search' },
  { path: '/import', label: 'Import', icon: 'pi pi-upload' },
  { path: '/stats', label: 'Stats', icon: 'pi pi-chart-bar' },
  { path: '/settings', label: 'Settings', icon: 'pi pi-cog' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
