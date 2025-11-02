<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="8">
          <v-card-title class="text-h5 text-center mb-4">Reset Password</v-card-title>

          <v-form @submit.prevent="handleReset">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :error-messages="emailError"
              readonly
              required
            />

            <input type="hidden" v-model="token" />

            <v-text-field
              ref="passwordField"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="New Password"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="togglePasswordVisibility('password')"
              :error-messages="passwordError"
              required
            />

            <v-text-field
              ref="confirmField"
              v-model="password_confirmation"
              :type="showConfirm ? 'text' : 'password'"
              label="Confirm Password"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="togglePasswordVisibility('confirm')"
              :error-messages="confirmError"
              required
            />

            <v-btn type="submit" color="success" block class="mt-4" :loading="isLoading">
              Reset Password
            </v-btn>

            <div v-if="success" class="mt-4 text-center">
              <v-icon color="success" size="48" class="mb-2">mdi-check-circle</v-icon>
              <div class="text-success text-h6 font-weight-medium">{{ success }}</div>
              <div class="text-caption text-medium-emphasis mt-1">Redirecting to login page...</div>
            </div>

            <v-alert v-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from '@/store'
import { resetPassword } from '@/store/authApi'

const email = ref('')
const token = ref('')
const password = ref('')
const password_confirmation = ref('')
const isLoading = ref(false)
const success = ref('')
const error = ref('')

const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')

const passwordField = ref()
const confirmField = ref()

const showPassword = ref(false)
const showConfirm = ref(false)

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const query = route.query
  if (query.email) email.value = query.email as string
  if (query.token) token.value = query.token as string
})

const togglePasswordVisibility = (field: 'password' | 'confirm') => {
  let cursorPosition = 0
  let inputElement: HTMLInputElement | null = null

  if (field === 'password') {
    cursorPosition = passwordField.value.$el.querySelector('input')?.selectionStart || 0
    showPassword.value = !showPassword.value
    inputElement = passwordField.value.$el.querySelector('input')
  } else {
    cursorPosition = confirmField.value.$el.querySelector('input')?.selectionStart || 0
    showConfirm.value = !showConfirm.value
    inputElement = confirmField.value.$el.querySelector('input')
  }

  setTimeout(() => {
    if (inputElement) {
      inputElement.focus()
      inputElement.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, 0)
}

const handleReset = async () => {
  emailError.value = email.value ? '' : 'Email is required'
  passwordError.value = password.value ? '' : 'Password is required'
  confirmError.value = password_confirmation.value ? '' : 'Confirm password'
  if (password.value !== password_confirmation.value) {
    confirmError.value = 'Passwords do not match'
  }

  if (
    !email.value ||
    !token.value ||
    !password.value ||
    password.value !== password_confirmation.value
  ) {
    return
  }

  isLoading.value = true
  success.value = ''
  error.value = ''

  try {
    await store
      .dispatch(
        resetPassword.initiate({
          email: email.value,
          token: token.value,
          password: password.value,
          password_confirmation: password_confirmation.value,
        }),
      )
      .unwrap()

    success.value = 'Password reset successfully!'

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    error.value = err?.data?.error || 'Invalid or expired token'
  } finally {
    isLoading.value = false
  }
}
</script>
