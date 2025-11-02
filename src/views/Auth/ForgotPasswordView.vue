<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="8">
          <v-card-title class="text-h5 text-center mb-4">Forgot Password</v-card-title>

          <v-form @submit.prevent="sendResetLink">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :error-messages="emailError"
              required
            />

            <v-btn type="submit" color="warning" block class="mt-4" :loading="isLoading">
              Send Reset Link
            </v-btn>

            <v-alert v-if="success" type="success" class="mt-4">
              {{ success }}
            </v-alert>

            <v-alert v-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>

            <div class="text-center mt-4">
              <router-link to="/login" class="text-decoration-none"> Back to Login </router-link>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { store } from '@/store'
import { forgotPassword } from '@/store/authApi'

const email = ref('')
const isLoading = ref(false)
const success = ref('')
const error = ref('')
const emailError = ref('')

const sendResetLink = async () => {
  emailError.value = email.value ? '' : 'Email is required'
  if (!email.value) return

  isLoading.value = true
  success.value = ''
  error.value = ''

  try {
    const result = await store.dispatch(forgotPassword.initiate({ email: email.value })).unwrap()

    success.value = result.message
    if (result.debug_token) {
      console.log('Debug Token:', result.debug_token)
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to send reset link'
  } finally {
    isLoading.value = false
  }
}
</script>
