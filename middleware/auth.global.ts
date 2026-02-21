export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { authenticated, checkAuth, loading } = useAuth()

  if (loading.value) {
    await checkAuth()
  }

  if (to.path === '/login') {
    if (authenticated.value) return navigateTo('/')
    return
  }

  if (!authenticated.value) {
    return navigateTo('/login')
  }
})
