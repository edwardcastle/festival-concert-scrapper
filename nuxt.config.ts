import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@primevue/nuxt-module'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  primevue: {
    options: {
      theme: 'none',
      ripple: true,
    },
    cssLayer: {
      name: 'primevue',
      order: 'theme, base, primevue',
    },
  },

  runtimeConfig: {
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    sessionSecret: process.env.SESSION_SECRET || 'latin-connect-secret-key',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    serperApiKey: process.env.SERPER_API_KEY || '',
    public: {
      appName: 'LatinConnect',
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
})
