<template>
  <v-container>
    <v-btn @click="$router.back()" class="mb-4" variant="text">
      <v-icon left>mdi-arrow-left</v-icon>
      Back
    </v-btn>

    <v-row v-if="recipe">
      <v-col cols="12" md="6">
        <v-img :src="recipe.picture || fallbackImage" height="400" cover class="rounded-xl">
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-icon size="64" color="grey">mdi-silverware-fork-knife</v-icon>
            </div>
          </template>
        </v-img>
      </v-col>

      <v-col cols="12" md="6">
        <h1 class="text-h3 mb-2">{{ recipe.name }}</h1>
        <v-chip color="primary" class="mb-4">
          {{ recipe.cuisine_type }}
        </v-chip>

        <p class="text-body-1 mb-4">
          <v-icon small class="mr-1">mdi-account</v-icon>
          By <strong>{{ recipe.user?.name || 'Unknown Chef' }}</strong>
        </p>

        <v-divider class="my-6" />

        <h2 class="text-h5 mb-3">
          <v-icon left>mdi-format-list-bulleted</v-icon>
          Ingredients
        </h2>
        <v-chip
          v-for="(ing, i) in recipe.ingredients"
          :key="i"
          class="mr-2 mb-2"
          color="primary"
          variant="outlined"
        >
          {{ ing }}
        </v-chip>

        <h2 class="text-h5 my-4">
          <v-icon left>mdi-chef-hat</v-icon>
          Steps
        </h2>
        <ol class="text-body-1 pl-4">
          <li v-for="(step, i) in recipe.steps" :key="i" class="mb-3">
            {{ step }}
          </li>
        </ol>
      </v-col>
    </v-row>

    <v-skeleton-loader v-else-if="loading" type="card, list-item-three-line@5" />

    <v-alert v-else-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>

    <v-alert v-else type="warning" class="mt-4"> Recipe not found </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '@/store'
import { recipesApi } from '@/store/recipesApi'

const route = useRoute()
const recipeId = Number(route.params.id)

const recipe = ref<any>(null)
const loading = ref(true)
const error = ref('')

const fallbackImage = 'https://via.placeholder.com/400x300/f5f5f5/cccccc?text=No+Image'

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''

    let recipeData = null

    try {
      const result = await store.dispatch(recipesApi.endpoints.getRecipe.initiate(recipeId))

      if (result.data?.data) {
        recipeData = result.data.data
      } else if (result.data) {
        recipeData = result.data
      }
    } catch (apiError) {
      const allRecipesResult = await store.dispatch(recipesApi.endpoints.getAllRecipes.initiate())

      const recipesArray =
        (allRecipesResult.data as any)?.data || (allRecipesResult.data as any) || []
      recipeData = recipesArray.find((r: any) => r.id === recipeId)
    }

    if (recipeData) {
      recipe.value = recipeData
    } else {
      error.value = 'Recipe not found'
    }
  } catch (err: any) {
    error.value = err?.data?.error || err?.message || 'Failed to load recipe'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.pl-4 {
  padding-left: 1rem;
}
</style>
