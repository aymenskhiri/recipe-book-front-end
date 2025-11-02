<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="8">
          <v-card-title class="text-h5 text-center mb-4">Login</v-card-title>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :error-messages="emailError"
              required
            />

            <!-- PASSWORD + EYE (EXACT SAME AS RESET) -->
            <v-text-field
              ref="passwordField"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="togglePasswordVisibility"
              :error-messages="passwordError"
              required
            />

            <v-btn type="submit" color="primary" block class="mt-4" :loading="isLoading">
              Login
            </v-btn>

            <v-alert v-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>

            <div class="text-center mt-4">
              <router-link to="/register" class="text-decoration-none">
                Don't have an account? Register
              </router-link>
            </div>

            <div class="text-center mt-2">
              <router-link to="/forgot-password" class="text-decoration-none text-caption">
                Forgot your password?
              </router-link>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '@/store'
import { login } from '@/store/authApi'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const emailError = ref('')
const passwordError = ref('')
 
const passwordField = ref<any>(null)

const router = useRouter()
 
const togglePasswordVisibility = () => {
  const input = passwordField.value?.$el.querySelector('input')
  const cursorPosition = input?.selectionStart || 0

  showPassword.value = !showPassword.value

  setTimeout(() => {
    const newInput = passwordField.value.$el.querySelector('input')
    if (newInput) {
      newInput.focus()
      newInput.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, 0)
}

const handleLogin = async () => {
  emailError.value = email.value ? '' : 'Email is required'
  passwordError.value = password.value ? '' : 'Password is required'
  if (!email.value || !password.value) return

  isLoading.value = true
  error.value = ''

  try {
    const result = await store
      .dispatch(login.initiate({ email: email.value, password: password.value }))
      .unwrap()

    localStorage.setItem('token', result.token)
    console.log('Logged in:', result.user)
    router.push('/')
  } catch (err: any) {
    error.value = err?.data?.error || 'Invalid credentials'
  } finally {
    isLoading.value = false
  }
}
</script>
