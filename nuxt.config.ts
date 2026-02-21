import tailwindcss from '@tailwindcss/vite'
import Aura from '@primevue/themes/aura'

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
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
      ripple: true,
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
