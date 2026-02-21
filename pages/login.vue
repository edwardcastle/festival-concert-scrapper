<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-navy)]">
    <div
      class="w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8"
    >
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">
          <span class="text-[var(--color-gold)]">Latin</span>
          <span class="text-white">Connect</span>
        </h1>
        <p class="text-sm text-[var(--color-text-muted)] mt-2">
          Latin Music CRM
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-muted)]">Password</label>
          <Password
            v-model="password"
            :feedback="false"
            toggleMask
            class="w-full"
            inputClass="w-full"
            placeholder="Enter admin password"
          />
        </div>

        <p v-if="error" class="text-sm text-[var(--color-red)]">
          Invalid password. Please try again.
        </p>

        <Button
          type="submit"
          label="Login"
          :loading="submitting"
          class="w-full"
          severity="info"
        />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import Password from 'primevue/password'
import Button from 'primevue/button'

definePageMeta({ layout: 'blank' })

const password = ref('')
const error = ref(false)
const submitting = ref(false)
const { login } = useAuth()

const handleLogin = async () => {
  error.value = false
  submitting.value = true
  const success = await login(password.value)
  submitting.value = false
  if (success) {
    navigateTo('/')
  } else {
    error.value = true
  }
}
</script>
