<template>
  <v-container fluid class="pa-4">
    <v-row align="center" class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold">All Recipes</h1>
        <p class="text-body-1 text-grey mt-2">Discover delicious recipes from our community</p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          v-if="isAdmin"
          color="secondary"
          size="large"
          class="ml-2"
          @click="$router.push('/admin')"
        >
          <v-icon left>mdi-shield-account</v-icon>
          Admin Panel
        </v-btn>
        <v-btn color="success" size="large" class="ml-2" @click="$router.push('/create-recipe')">
          <v-icon left>mdi-plus</v-icon>
          Add Recipe
        </v-btn>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-alert v-if="error" type="error" dismissible class="mb-6" @click:close="error = null">
      {{ error }}
    </v-alert>

    <v-card class="mb-6">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Search recipes..."
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedCuisine"
              :items="cuisineTypesArray"
              label="Filter by cuisine"
              density="comfortable"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col v-for="recipe in filteredRecipes" :key="recipe.id" cols="12" sm="6" md="4" lg="3">
        <v-card
          hover
          elevation="8"
          class="rounded-xl overflow-hidden transition"
          @click="$router.push(`/recipe/${recipe.id}`)"
          style="cursor: pointer"
        >
          <div class="relative">
            <v-img
              :src="recipe.picture || fallbackImage"
              height="200"
              cover
              class="bg-grey-lighten-3"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon size="64" color="grey">mdi-silverware-fork-knife</v-icon>
                </div>
              </template>
            </v-img>
            <v-chip class="absolute top-2 left-2" color="primary" small label>
              {{ recipe.cuisine_type }}
            </v-chip>
          </div>

          <v-card-title class="text-h6 font-weight-bold pt-4 pb-2">
            {{ recipe.name }}
          </v-card-title>

          <v-card-subtitle class="pb-3">
            <v-icon small class="mr-1">mdi-account</v-icon>
            {{ recipe.user?.name || 'Unknown Chef' }}
          </v-card-subtitle>

          <v-card-text>
            <div class="text-caption grey--text text--darken-2 mb-2">
              <strong>Ingredients:</strong>
              {{ displayIngredients(recipe.ingredients) }}
            </div>

            <div class="text-caption grey--text text--darken-2">
              <strong>Steps:</strong>
              {{ displaySteps(recipe.steps) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!loading && filteredRecipes.length === 0" class="text-center py-12">
      <v-icon size="80" color="grey lighten-2">mdi-pot-steam</v-icon>
      <p class="text-h6 mt-4 grey--text">
        {{
          search || selectedCuisine || selectedAuthor
            ? 'No recipes match your filters'
            : 'No recipes yet. Be the first chef!'
        }}
      </p>
      <v-btn
        v-if="search || selectedCuisine || selectedAuthor"
        color="primary"
        class="mt-4 mr-2"
        @click="clearFilters"
      >
        Clear Filters
      </v-btn>
      <v-btn
        v-if="!search && !selectedCuisine && !selectedAuthor"
        color="primary"
        class="mt-4"
        @click="$router.push('/create-recipe')"
      >
        Create First Recipe
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAllRecipes } from '@/composables/useRecipes'

const fallbackImage = 'https://via.placeholder.com/300x200/f5f5f5/cccccc?text=No+Image'

const { recipes, loading, error } = useAllRecipes()

const search = ref('')
const selectedCuisine = ref('')
const selectedAuthor = ref('')

const user = computed(() => {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
})

const isAdmin = computed(() => {
  return user.value?.role === 'admin' || user.value?.is_admin === true
})

const cuisineTypes = computed(() => {
  const cuisines = new Set()
  recipes.value.forEach((recipe) => {
    if (recipe.cuisine_type) {
      cuisines.add(recipe.cuisine_type)
    }
  })
  return cuisines
})

const cuisineTypesArray = computed(() => Array.from(cuisineTypes.value) as string[])

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesSearch =
      !search.value ||
      recipe.name.toLowerCase().includes(search.value.toLowerCase()) ||
      recipe.cuisine_type.toLowerCase().includes(search.value.toLowerCase())

    const matchesCuisine = !selectedCuisine.value || recipe.cuisine_type === selectedCuisine.value

    const matchesAuthor = !selectedAuthor.value || recipe.user?.name === selectedAuthor.value

    return matchesSearch && matchesCuisine && matchesAuthor
  })
})

const displayIngredients = (ingredients: string[]) => {
  if (!ingredients || ingredients.length === 0) return 'No ingredients'

  const displayItems = ingredients.slice(0, 2)
  let result = displayItems.join(', ')

  if (ingredients.length > 2) {
    result += `... (+${ingredients.length - 2} more)`
  }

  return result
}

const displaySteps = (steps: string[]) => {
  if (!steps || steps.length === 0) return 'No steps'

  const firstStep = steps[0].substring(0, 60)
  let result = firstStep

  if (firstStep.length >= 60) {
    result += '...'
  }

  if (steps.length > 1) {
    result += ` (+${steps.length - 1} more steps)`
  }

  return result
}

const clearFilters = () => {
  search.value = ''
  selectedCuisine.value = ''
  selectedAuthor.value = ''
}
</script>

<style scoped>
.transition {
  transition: transform 0.2s ease-in-out;
}
.transition:hover {
  transform: translateY(-4px);
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
  z-index: 1;
}
</style>
