<template>
  <div
    style="width: 100%; max-width: 400px; background: #1e1e36; border: 1px solid #2e2e4e; border-radius: 12px; padding: 2rem;"
  >
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="font-size: 1.5rem; font-weight: bold;">
        <span style="color: #f59e0b;">Latin</span>
        <span style="color: white;">Connect</span>
      </h1>
      <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 0.5rem;">
        Latin Music CRM
      </p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div class="flex flex-col gap-1">
        <label style="font-size: 0.75rem; color: #94a3b8;">Password</label>
        <Password
          v-model="password"
          :feedback="false"
          toggleMask
          class="w-full"
          inputClass="w-full"
          placeholder="Enter admin password"
        />
      </div>

      <p v-if="error" style="font-size: 0.875rem; color: #ef4444;">
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
