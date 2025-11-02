<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="8">
          <v-card-title class="text-h5 text-center mb-4">Register</v-card-title>

          <v-form @submit.prevent="handleRegister">
            <v-text-field
              v-model="name"
              label="Name"
              prepend-inner-icon="mdi-account"
              :error-messages="nameError"
              required
            />

            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :error-messages="emailError"
              required
            />

            <v-text-field
              ref="passwordField"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
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
              Create Account
            </v-btn>

            <v-alert v-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>

            <div class="text-center mt-4">
              <router-link to="/login" class="text-decoration-none">
                Already have an account? Login
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
import { register } from '@/store/authApi'
import { eventBus } from '@/utils/eventBus'

const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const isLoading = ref(false)
const error = ref('')

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')

const passwordField = ref<any>(null)
const confirmField = ref<any>(null)
const showPassword = ref(false)
const showConfirm = ref(false)

const router = useRouter()

const togglePasswordVisibility = (field: 'password' | 'confirm') => {
  let cursorPosition = 0
  let inputElement: HTMLInputElement | null = null

  if (field === 'password') {
    const input = passwordField.value?.$el.querySelector('input')
    cursorPosition = input?.selectionStart || 0
    showPassword.value = !showPassword.value
    inputElement = passwordField.value?.$el.querySelector('input')
  } else {
    const input = confirmField.value?.$el.querySelector('input')
    cursorPosition = input?.selectionStart || 0
    showConfirm.value = !showConfirm.value
    inputElement = confirmField.value?.$el.querySelector('input')
  }

  setTimeout(() => {
    if (inputElement) {
      inputElement.focus()
      inputElement.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, 0)
}

const handleRegister = async () => {
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmError.value = ''
  error.value = ''

  if (!name.value) nameError.value = 'Name is required'
  if (!email.value) emailError.value = 'Email is required'
  if (!password.value) passwordError.value = 'Password is required'
  if (!password_confirmation.value) confirmError.value = 'Confirm password is required'

  if (password.value !== password_confirmation.value) {
    confirmError.value = 'Passwords do not match'
  }

  if (
    !name.value ||
    !email.value ||
    !password.value ||
    !password_confirmation.value ||
    password.value !== password_confirmation.value
  )
    return

  isLoading.value = true

  try {
    const result = await store
      .dispatch(
        register.initiate({
          name: name.value,
          email: email.value,
          password: password.value,
          password_confirmation: password_confirmation.value,
        }),
      )
      .unwrap()

    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))

    console.log('Registered & logged in:', result.user)

    eventBus.emit('auth-changed')

    setTimeout(() => {
      router.push('/')
    }, 100)
  } catch (err: any) {
    error.value = err?.data?.message || 'Registration failed'
  } finally {
    isLoading.value = false
  }
}
</script>
