<template>
  <v-container>
    <v-card>
      <v-card-title>Welcome!</v-card-title>
      <v-card-text>
        <p>
          Token: <code>{{ token }}</code>
        </p>
        <v-btn @click="logout" color="error">Logout</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const token = localStorage.getItem('token') || 'None'

const logout = () => {
  localStorage.removeItem('token')
  window.location.href = '/login'
}
</script>
