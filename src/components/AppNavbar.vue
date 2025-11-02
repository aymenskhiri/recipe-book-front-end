<template>
  <v-app-bar app color="primary" dark flat>
    <v-app-bar-nav-icon v-if="isAuthenticated" @click="drawer = !drawer" class="hidden-lg-and-up" />

    <v-toolbar-title class="text-h6 font-weight-bold">
      <router-link to="/" class="text-white text-decoration-none"> RecipeBook </router-link>
    </v-toolbar-title>

    <v-spacer />
 
    <div v-if="isAuthenticated" class="hidden-md-and-down">
      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/my-recipes">My Recipes</v-btn>
      <v-btn v-if="isAdmin" text to="/admin" color="secondary">
        <v-icon left>mdi-shield-account</v-icon>
        Admin
      </v-btn>
    </div>
 
    <v-menu v-if="isAuthenticated" offset-y>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon class="ml-4">
          <v-avatar size="36">
            <v-icon>mdi-account-circle</v-icon>
          </v-avatar>
        </v-btn>
      </template>

      <v-list density="compact">
        <v-list-item>
          <v-list-item-title class="font-weight-medium">
            {{ currentUser?.name || currentUserEmail || 'User' }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ currentUserEmail }}</v-list-item-subtitle>
        </v-list-item>

        <v-divider />

        <v-list-item @click="logout" color="error">
          <v-list-item-title>
            <v-icon start>mdi-logout</v-icon>
            Logout
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
 
    <div v-else class="hidden-md-and-down">
      <v-btn text to="/login" class="mr-2">Login</v-btn>
      <v-btn color="secondary" to="/register">Register</v-btn>
    </div>
  </v-app-bar>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { eventBus } from '@/utils/eventBus'

const router = useRouter()
const drawer = ref(false)
 
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}
 
const currentUser = ref(getCurrentUser())
const authToken = ref(localStorage.getItem('token'))
 
const currentUserEmail = computed(() => {
  return currentUser.value?.email || 'User'
})

const isAuthenticated = computed(() => {
  return !!authToken.value
})

const isAdmin = computed(() => {
  return currentUser.value?.role === 'admin' || currentUser.value?.is_admin === true
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  currentUser.value = null
  authToken.value = null
  eventBus.emit('auth-changed')
  router.push('/login')
}

const updateUserData = () => {
  console.log('Updating user data in navbar...')
  currentUser.value = getCurrentUser()
  authToken.value = localStorage.getItem('token')
}
 
watch(
  () => router.currentRoute.value.path,
  () => {
    updateUserData()
  },
)

onMounted(() => {
  console.log('Navbar mounted, setting up event listeners...')
 
  eventBus.on('auth-changed', updateUserData)
 
  router.afterEach(() => {
    updateUserData()
  })
 
  updateUserData()
})

onUnmounted(() => {
  eventBus.off('auth-changed', updateUserData)
})
</script>

<style scoped>
.v-app-bar {
  backdrop-filter: blur(10px);
}
</style>
