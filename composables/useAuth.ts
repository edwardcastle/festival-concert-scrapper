export const useAuth = () => {
  const authenticated = useState('auth', () => false)
  const loading = useState('auth-loading', () => true)

  const login = async (password: string) => {
    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { password },
      })
      authenticated.value = true
      return true
    } catch {
      return false
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    authenticated.value = false
    navigateTo('/login')
  }

  const checkAuth = async () => {
    try {
      const res = await $fetch<{ authenticated: boolean }>('/api/auth/check')
      authenticated.value = res.authenticated
    } catch {
      authenticated.value = false
    } finally {
      loading.value = false
    }
    return authenticated.value
  }

  return { authenticated, loading, login, logout, checkAuth }
}
