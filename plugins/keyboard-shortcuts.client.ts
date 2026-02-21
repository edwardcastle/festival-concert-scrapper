export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ctrl+K — focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      const searchInput = document.querySelector(
        'input[placeholder*="Search"]'
      ) as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      } else {
        navigateTo('/search')
      }
    }

    // Ctrl+N — new contact (via custom event)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('shortcut:new-contact'))
    }

    // Esc — close dialogs
    if (e.key === 'Escape') {
      window.dispatchEvent(new CustomEvent('shortcut:escape'))
    }
  })
})
