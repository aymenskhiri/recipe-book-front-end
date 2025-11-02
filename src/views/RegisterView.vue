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
              v-model="password"
              label="Password"
              type="password"
              prepend-inner-icon="mdi-lock"
              :error-messages="passwordError"
              required
            />

            <v-text-field
              v-model="password_confirmation"
              label="Confirm Password"
              type="password"
              prepend-inner-icon="mdi-lock-check"
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

const router = useRouter()

const handleRegister = async () => {
  nameError.value = name.value ? '' : 'Name is required'
  emailError.value = email.value ? '' : 'Email is required'
  passwordError.value = password.value ? '' : 'Password is required'
  confirmError.value = password_confirmation.value ? '' : 'Confirm password'
  if (password.value !== password_confirmation.value) {
    confirmError.value = 'Passwords do not match'
  }
  if (
    !name.value ||
    !email.value ||
    !password.value ||
    password.value !== password_confirmation.value
  )
    return

  isLoading.value = true
  error.value = ''

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

    // Auto-login after register
    localStorage.setItem('token', result.token)
    console.log('Registered & logged in:', result.user)
    router.push('/')
  } catch (err: any) {
    error.value = err?.data?.message || 'Registration failed'
  } finally {
    isLoading.value = false
  }
}
</script>
